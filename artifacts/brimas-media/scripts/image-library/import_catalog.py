"""Import an existing Cloudinary CSV export. Dry-run by default; never uploads."""
import argparse
import concurrent.futures
import csv
import hashlib
import json
from pathlib import Path
import sys
import time

from cloudinary import verify_asset

APP = Path(__file__).resolve().parents[2]
CATALOG = APP / "src/lib/image-library/catalog.json"
REVIEWS = Path(__file__).with_name("reviewed-assets.json")
REQUIRED = {"filename", "url", "publicId", "assetId", "format", "assetType", "deliveryType"}
CATEGORIES = {"printing", "large-format", "garment-branding", "workwear", "ppe",
              "corporate-gifts", "promotional-products", "bags-accessories",
              "signage", "vehicle-branding", "event-branding", "portfolio", "needs-review"}
PROVENANCE = {"photo", "mockup", "unknown"}


def save_catalog(catalog):
    active = {}
    for asset in catalog["assets"]:
        if asset["status"] != "mapped":
            continue
        for fallback in asset.get("localBindings", []):
            active[fallback] = {
                "id": asset["id"], "alt": asset["alt"], "provenance": asset["provenance"],
                "width": asset["delivery"]["width"], "height": asset["delivery"]["height"],
                "url": asset["delivery"]["url"],
                "variants": [{key: variant[key] for key in ("url", "width", "height")} for variant in asset["variants"]],
            }
    CATALOG.parent.mkdir(parents=True, exist_ok=True)
    # Generate small browser config; the full review inventory is not bundled.
    for path, data in ((CATALOG, catalog), (CATALOG.with_name("active-images.json"), active)):
        temp = path.with_suffix(".tmp")
        temp.write_text(json.dumps(data, indent=2) + "\n")
        temp.replace(path)


def apply_validated(report_dir):
    report = json.loads((report_dir / "import-report.json").read_text())
    candidate = (report_dir / "candidate-catalog.json").read_bytes()
    if report["errors"] or hashlib.sha256(candidate).hexdigest() != report["candidateSha256"]:
        raise ValueError("Candidate has validation errors or changed after verification")
    if time.time() - report["verifiedAtUnix"] > 86400:
        raise ValueError("Public URL verification is older than 24 hours; run a new dry-run")
    catalog = json.loads(candidate)
    # Retain independent batches applied since this candidate was generated.
    existing = json.loads(CATALOG.read_text())["assets"] if CATALOG.exists() else []
    catalog["assets"] = assemble(catalog["assets"], existing)
    save_catalog(catalog)
    print(f'Applied {len(catalog["assets"])} verified catalog entries; no reuploads or repeated delivery probes.')


def load_rows(file):
    with file.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if not REQUIRED.issubset(reader.fieldnames or []):
            raise ValueError(f"Missing CSV columns: {sorted(REQUIRED - set(reader.fieldnames or []))}")
        rows = list(reader)
    if not rows:
        raise ValueError("The CSV contains no assets")
    ids, public_ids, urls = set(), set(), set()
    for row in rows:
        for key, seen in (("assetId", ids), ("publicId", public_ids), ("url", urls)):
            if not row[key] or row[key] in seen:
                raise ValueError(f"Missing or duplicate {key}: {row[key]}")
            seen.add(row[key])
    return rows


def apply_review(asset, review, pages):
    if not review:
        return {**asset, "category": "needs-review", "provenance": "unknown",
                "status": "needs-review", "subject": None, "alt": None,
                "pages": [], "roles": [], "localBindings": [],
                "reviewReason": "No verified visual review. Filename alone is not evidence."}
    if review["category"] not in CATEGORIES or review["provenance"] not in PROVENANCE:
        raise ValueError(f'Invalid category/provenance for {asset["publicId"]}')
    if not set(review.get("pages", [])).issubset(pages):
        raise ValueError(f'Unknown existing page for {asset["publicId"]}')
    bindings = review.get("localBindings", [])
    if bindings and (review["status"] != "mapped" or review["provenance"] == "unknown"):
        raise ValueError("Uncertain assets cannot replace local images")
    if review["status"] not in ("mapped", "needs-review"):
        raise ValueError("Invalid review status")
    if review["status"] == "mapped" and (
            not review.get("alt") or not review.get("pages") or not review.get("roles")
            or review["provenance"] == "unknown"):
        raise ValueError("Mapped assets need descriptive alt text, provenance, pages and roles")
    if (review.get("alt") or "").lower() in ("image", "photo", "picture", "brimas image"):
        raise ValueError("Generic alt text is not allowed")
    for path in bindings:
        if not path.startswith("/products/") or ".." in path or not (APP / "public" / path[1:]).is_file():
            raise ValueError(f"Missing or unsafe local fallback: {path}")
    return {**asset, **review, "reviewEvidence": "Visual inspection of exported public asset previews; not proof of client work."}


def assemble(assets, existing):
    merged = {asset["id"]: asset for asset in existing}
    for asset in assets:
        merged[asset["id"]] = asset
    result = sorted(merged.values(), key=lambda asset: asset["id"])
    public_ids, bindings = set(), set()
    for asset in result:
        if asset["publicId"] in public_ids:
            raise ValueError(f'Duplicate public ID across batches: {asset["publicId"]}')
        public_ids.add(asset["publicId"])
        for path in asset.get("localBindings", []):
            if path in bindings:
                raise ValueError(f"Two assets claim the same local fallback: {path}")
            bindings.add(path)
    return result


def import_batch(input_file, reviews_file, report_dir, apply=False, workers=4):
    rows = load_rows(input_file)
    reviews = json.loads(reviews_file.read_text()) if reviews_file.exists() else {}
    # The route source is the authority; no new pages are created by the importer.
    import re
    pages = {"/", "/price-list", "/request-a-quote"}
    pages.update(re.findall(r"path: '([^']+)'", (APP / "src/seo/service-data.ts").read_text()))
    errors, assets = [], []

    def process(row):
        try:
            return apply_review(verify_asset(row), reviews.get(row["publicId"]), pages), None
        except Exception as exc:
            return None, {"publicId": row["publicId"], "error": str(exc)}

    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        for asset, error in pool.map(process, rows):
            if error:
                errors.append(error)
            else:
                assets.append(asset)
    # Exact rendered-pixel duplicates are quarantined, not silently discarded.
    hashes = {}
    duplicates = []
    for asset in assets:
        fingerprint = (asset["delivery"]["width"], asset["delivery"]["height"], asset["delivery"]["pixelSha256"])
        if fingerprint in hashes:
            original = hashes[fingerprint]
            duplicates.append({"id": asset["id"], "duplicateOf": original})
            asset.update(status="needs-review", localBindings=[], duplicateOf=original,
                         reviewReason="Identical verified delivery pixels; do not publish a duplicate.")
        else:
            hashes[fingerprint] = asset["id"]
    existing = json.loads(CATALOG.read_text())["assets"] if CATALOG.exists() else []
    try:
        merged = assemble(assets, existing)
    except ValueError as exc:
        errors.append({"error": str(exc)})
        merged = []
    report = {
        "mode": "apply" if apply else "dry-run", "inputAssets": len(rows),
        "verifiedAssets": len(assets), "mappedAssets": sum(a["status"] == "mapped" for a in assets),
        "needsReview": sum(a["status"] == "needs-review" for a in assets),
        "activeBindings": sum(len(a.get("localBindings", [])) for a in assets),
        "verifiedDeliveryUrls": sum(1 + len(a["variants"]) for a in assets),
        "exactPixelDuplicates": duplicates, "errors": errors,
        "uploads": 0, "originalsDownloaded": 0, "repositoryImageBytesAdded": 0,
        "note": "Only this CSV batch was inspected. Do not interpret its size as the full account inventory.",
        "verifiedAtUnix": int(time.time()),
    }
    catalog = {"schemaVersion": 1, "cloudName": "zjzxwgcq", "assets": merged}
    report_dir.mkdir(parents=True, exist_ok=True)
    # Candidate + report are written even on failure; the active catalog is all-or-nothing.
    candidate = (json.dumps(catalog, indent=2) + "\n").encode()
    report["candidateSha256"] = hashlib.sha256(candidate).hexdigest()
    (report_dir / "candidate-catalog.json").write_bytes(candidate)
    (report_dir / "import-report.json").write_text(json.dumps(report, indent=2) + "\n")
    if apply and not errors:
        save_catalog(catalog)
    print(json.dumps(report, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv", type=Path, nargs="?")
    parser.add_argument("--reviews", type=Path, default=REVIEWS)
    parser.add_argument("--report-dir", type=Path, default=APP / ".media-import/latest")
    parser.add_argument("--apply", action="store_true", help="Commit metadata only after every asset validates")
    parser.add_argument("--apply-validated", action="store_true", help="Apply the unmodified dry-run candidate within 24 hours without probing again")
    parser.add_argument("--workers", type=int, choices=range(1, 9), default=4)
    args = parser.parse_args()
    try:
        if args.apply_validated:
            if args.csv or args.apply:
                parser.error("--apply-validated takes only --report-dir")
            apply_validated(args.report_dir)
        else:
            if not args.csv:
                parser.error("CSV path is required")
            sys.exit(import_batch(args.csv, args.reviews, args.report_dir, args.apply, args.workers))
    except (ValueError, OSError) as exc:
        print(f"Import refused: {exc}", file=sys.stderr)
        sys.exit(1)