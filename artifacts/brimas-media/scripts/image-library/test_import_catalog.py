import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import cloudinary
import import_catalog as importer

ROW = {
    "filename": "test", "url": "https://res.cloudinary.com/zjzxwgcq/image/upload/v123/test.jpg",
    "publicId": "test", "assetId": "a" * 32, "format": "jpg",
    "assetType": "image", "deliveryType": "upload", "moderationStatus": "",
}


class ImportTests(unittest.TestCase):
    def test_public_url_validation(self):
        self.assertEqual(cloudinary.source_version(ROW), 123)
        for url in (
            "http://res.cloudinary.com/zjzxwgcq/image/upload/v123/test.jpg",
            ROW["url"] + "?token=private", ROW["url"] + "#fragment",
            ROW["url"].replace("zjzxwgcq", "other-cloud"),
            ROW["url"].replace("test.jpg", "wrong-id.jpg"),
            ROW["url"].replace("res.cloudinary.com", "user:pass@res.cloudinary.com"),
        ):
            with self.subTest(url=url), self.assertRaises(ValueError):
                cloudinary.source_version({**ROW, "url": url})

    def test_missing_or_duplicate_csv_metadata(self):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "assets.csv"
            file.write_text("filename,url\nname,url\n")
            with self.assertRaises(ValueError):
                importer.load_rows(file)
            import csv
            with file.open("w", newline="") as stream:
                writer = csv.DictWriter(stream, fieldnames=list(ROW))
                writer.writeheader()
                writer.writerows([ROW, ROW])
            with self.assertRaises(ValueError):
                importer.load_rows(file)

    def test_unseen_images_are_not_invented(self):
        entry = importer.apply_review({"id": "a", "publicId": "random-file"}, None, {"/"})
        self.assertEqual(entry["status"], "needs-review")
        self.assertEqual(entry["provenance"], "unknown")
        self.assertIsNone(entry["alt"])
        self.assertEqual(entry["localBindings"], [])

    def test_review_pool_can_preserve_unknown_alt_without_publishing(self):
        review = {"category": "needs-review", "provenance": "unknown", "status": "needs-review",
                  "subject": None, "alt": None, "pages": [], "roles": [], "localBindings": [],
                  "reviewReason": "Insufficient evidence to publish"}
        entry = importer.apply_review({"id": "a", "publicId": "unassigned"}, review, {"/"})
        self.assertIsNone(entry["alt"])
        self.assertEqual(entry["status"], "needs-review")
        self.assertEqual(entry["localBindings"], [])

    def test_missing_fallback_or_new_page_refused(self):
        asset = {"id": "a", "publicId": "test"}
        review = {"category": "corporate-gifts", "provenance": "photo", "status": "mapped",
                  "alt": "Black gift box", "pages": ["/"], "roles": ["product-example"],
                  "localBindings": ["/products/does-not-exist.webp"]}
        with self.assertRaises(ValueError):
            importer.apply_review(asset, review, {"/"})
        with self.assertRaises(ValueError):
            importer.apply_review(asset, {**review, "pages": ["/invented-page"]}, {"/"})
        with self.assertRaises(ValueError):
            importer.apply_review(asset, {**review, "provenance": "unknown"}, {"/"})

    def test_stable_id_merge_and_binding_collision(self):
        old = {"id": "a", "publicId": "first", "localBindings": []}
        new = {**old, "alt": "Updated description"}
        self.assertEqual(importer.assemble([new], [old]), [new])
        other = {"id": "b", "publicId": "second", "localBindings": ["/products/same.webp"]}
        with self.assertRaises(ValueError):
            importer.assemble([other], [{**old, "localBindings": ["/products/same.webp"]}])

    def test_invalid_delivery_cannot_change_active_catalog(self):
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            csv_path = directory / "assets.csv"
            import csv
            with csv_path.open("w", newline="") as stream:
                writer = csv.DictWriter(stream, fieldnames=list(ROW))
                writer.writeheader()
                writer.writerow(ROW)
            active = directory / "catalog.json"
            active.write_text('{"assets":[]}')
            before = active.read_bytes()
            with patch.object(importer, "CATALOG", active), patch.object(importer, "verify_asset", side_effect=ValueError("Missing public image")):
                code = importer.import_batch(csv_path, directory / "no-reviews.json", directory / "report", apply=True)
            self.assertEqual(code, 1)
            self.assertEqual(active.read_bytes(), before)
            report = json.loads((directory / "report/import-report.json").read_text())
            self.assertEqual(len(report["errors"]), 1)
            self.assertEqual(report["uploads"], 0)

    def test_changed_or_stale_candidate_refused(self):
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            (directory / "candidate-catalog.json").write_text('{"assets":[]}')
            report = {"errors": [], "candidateSha256": "wrong", "verifiedAtUnix": 0}
            (directory / "import-report.json").write_text(json.dumps(report))
            with self.assertRaises(ValueError):
                importer.apply_validated(directory)
            import hashlib
            report["candidateSha256"] = hashlib.sha256((directory / "candidate-catalog.json").read_bytes()).hexdigest()
            (directory / "import-report.json").write_text(json.dumps(report))
            with self.assertRaises(ValueError):
                importer.apply_validated(directory)


if __name__ == "__main__":
    unittest.main()