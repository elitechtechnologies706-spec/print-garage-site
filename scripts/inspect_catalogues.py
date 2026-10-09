"""Inspect uploaded PDF catalogues without modifying their source files."""
from pathlib import Path
import json
import fitz
from PIL import Image, ImageDraw

ROOT = Path("generated-artifacts/catalogues")
ROOT.mkdir(parents=True, exist_ok=True)
files = [
    ("min", "attached_assets/0_MIN_cataloge_Garage_1791580275909.pdf"),
    ("drinkware", "attached_assets/0_DRINK_WARE_1791580363283.pdf"),
    ("eco", "attached_assets/0_Eco-Friendly_collection_1791580403010.pdf"),
    ("bags", "attached_assets/0_Bag_collection_(1)_1791580432041.pdf"),
    ("portfolio", "attached_assets/0_KCB_ITEMSs_1791580471650.pdf"),
]
inventory = []
for slug, path in files:
    document = fitz.open(path)
    folder = ROOT / slug
    folder.mkdir(exist_ok=True)
    page_records = []
    for index, page in enumerate(document):
        text = page.get_text()
        (folder / f"page-{index+1:03}.txt").write_text(text)
        images = []
        for image in page.get_image_info(xrefs=True):
            images.append({
                "xref": image["xref"], "bbox": image["bbox"],
                "width": image["width"], "height": image["height"],
            })
        page_records.append({"page": index+1, "text": text, "images": images,
                             "width": page.rect.width, "height": page.rect.height})
    inventory.append({"slug": slug, "path": path, "pages": page_records})
    for start in range(0, len(document), 24):
        count = min(24, len(document)-start)
        sheet = Image.new("RGB", (6*230, ((count+5)//6)*330), "#e8e8e8")
        draw = ImageDraw.Draw(sheet)
        for local in range(count):
            index = start+local
            page = document[index]
            pixmap = page.get_pixmap(matrix=fitz.Matrix(0.42, 0.42), alpha=False)
            image = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)
            image.thumbnail((220, 298))
            x, y = (local%6)*230+5, (local//6)*330+25
            sheet.paste(image, (x, y))
            draw.text((x, y-20), f"{slug} / page {index+1}", fill="black")
        sheet.save(folder / f"sheet-{start+1:03}.jpg", quality=88)
    print(slug, len(document), "pages", sum(len(p["images"]) for p in page_records), "image placements")
(ROOT / "inventory.json").write_text(json.dumps(inventory, indent=2))
