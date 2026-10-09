"""Extract embedded catalogue images, preserving source page and original colors."""
from pathlib import Path
import io
import json
import pymupdf as fitz
from PIL import Image, ImageDraw, ImageChops

ROOT = Path("generated-artifacts/catalogues")
inventory = json.loads((ROOT / "inventory.json").read_text())
records = []
for item in inventory:
    slug = item["slug"]
    if slug == "drinkware":
        continue  # These are scanned full-page images; use reviewed page crops.
    doc = fitz.open(item["path"])
    out = ROOT / slug / "cuts"
    out.mkdir(exist_ok=True)
    seen = set()
    for page_index, page in enumerate(doc):
        if slug in ("eco", "bags") and page_index == 0:
            continue
        image_refs = {r[0]: r for r in page.get_images(full=True)}
        for index, info in enumerate(page.get_image_info(xrefs=True)):
            xref = info["xref"]
            rect = fitz.Rect(info["bbox"])
            if not xref or xref in seen or min(info["width"], info["height"]) < 75:
                continue
            minimum_area = 0.006 if slug == "min" else 0.012
            if min(rect.width, rect.height) < 28 or rect.width*rect.height/page.rect.get_area() < minimum_area:
                continue
            seen.add(xref)
            pix = fitz.Pixmap(doc, xref)
            ref = image_refs.get(xref)
            if pix.colorspace and pix.colorspace.n > 3:
                pix = fitz.Pixmap(fitz.csRGB, pix)
            image = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGBA")
            if ref and ref[1]:
                mask_pix = fitz.Pixmap(doc, ref[1])
                mask = Image.open(io.BytesIO(mask_pix.tobytes("png"))).convert("L")
                image.putalpha(mask.resize(image.size, Image.Resampling.LANCZOS))
            canvas = Image.new("RGBA", image.size, "white")
            canvas.alpha_composite(image)
            image = canvas.convert("RGB")
            difference = ImageChops.difference(image, Image.new("RGB", image.size, "white"))
            bbox = difference.point(lambda x: 255 if x > 22 else 0).getbbox()
            if bbox:
                image = image.crop(bbox)
            image.thumbnail((900, 1100))
            padded = Image.new("RGB", (image.width+32, image.height+32), "white")
            padded.paste(image, (16, 16))
            name = f"{slug}-p{page_index+1:02}-{index+1:02}.webp"
            padded.save(out/name, quality=88, method=6)
            records.append({
                "file": str(out/name), "filename": name, "pdf": slug,
                "page": page_index+1, "index": index+1, "bbox": list(rect),
                "width": padded.width, "height": padded.height,
            })
    doc_records = [r for r in records if r["pdf"] == slug]
    for start in range(0, len(doc_records), 64):
        chunk = doc_records[start:start+64]
        sheet = Image.new("RGB", (8*170, ((len(chunk)+7)//8)*190), "#eeeeee")
        draw = ImageDraw.Draw(sheet)
        for i, record in enumerate(chunk):
            image = Image.open(record["file"])
            image.thumbnail((158, 157))
            x, y = (i%8)*170+6, (i//8)*190+25
            sheet.paste(image, (x, y))
            draw.text((x, y-20), record["filename"], fill="black")
        sheet.save(ROOT/slug/f"cuts-{start:03}.jpg", quality=90)
    print(slug, len(doc_records), "unique cuts")
(ROOT/"cuts.json").write_text(json.dumps(records, indent=2))
