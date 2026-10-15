"""Crop and prepare the client logos in the supplied Print Garage clients PDF."""
from pathlib import Path
import json

import pymupdf
from PIL import Image, ImageChops, ImageDraw, ImageFont

SOURCE = Path("attached_assets/PRINT_GARAGE_CLIENTS_1792069309749.pdf")
OUT = Path("generated-artifacts/partners-clients")
OUT.mkdir(parents=True, exist_ok=True)

NAMES = [
    "Dawn Awakenings",
    "Uganda Chamber of Energy & Minerals",
    "PwC",
    "Curl Up Unisex Salon",
    "Cina Butchery",
    "Rotary Club of Kampala North",
    "Kasinan Investments Ltd",
    "Africoff Industries (U) Limited",
    "UG-RIDES",
    "Grainpulse Ltd",
    "Amani Children's Clinic",
    "Seahorse",
    "Bwana Koffee",
    "Tanzania Ports Authority",
    "Gloss Car Wash",
    "Aloo",
    "Bold Brands",
    "Discovery Engineering",
    "Back to Source Tours",
    "Eclips Salon",
    "Forest Rally Team",
    "Titan Technologies",
    "TransTel Air Conditioning",
]

PAGE = pymupdf.open(SOURCE)[0]
SCALE = 3
rendered = PAGE.get_pixmap(matrix=pymupdf.Matrix(SCALE, SCALE), alpha=False)
sheet = Image.frombytes("RGB", (rendered.width, rendered.height), rendered.samples)

# The PDF is a three-column logo sheet, with two logos on its last row.
ROW_BANDS = [(0, 343), (343, 632), (632, 995), (995, 1259),
             (1259, 1627), (1627, 1904), (1904, 2268), (2268, sheet.height)]
mask = ImageChops.difference(sheet, Image.new("RGB", sheet.size, "white")).convert("L")
mask = mask.point(lambda value: 255 if value > 20 else 0)

def column_groups(y0, y1):
    counts = [
        mask.crop((x, y0, x + 1, y1)).histogram()[255]
        for x in range(sheet.width)
    ]
    groups = []
    start = None
    for x, count in enumerate(counts + [0]):
        active = count > 1
        if active and start is None:
            start = x
        elif not active and start is not None:
            if groups and start - groups[-1][1] <= 60:
                groups[-1] = (groups[-1][0], x - 1)
            else:
                groups.append((start, x - 1))
            start = None
    return groups

records = []
for index, name in enumerate(NAMES):
    row, col = divmod(index, 3)
    y0, y1 = ROW_BANDS[row]
    groups = column_groups(y0, y1)
    expected = 2 if row == 7 else 3
    if len(groups) != expected:
        raise ValueError(f"Expected {expected} logo columns in row {row + 1}, found {groups}")
    x0, x1 = groups[col]
    if name == "Tanzania Ports Authority":
        # The small line below the logo is document copy, not part of its mark.
        y1 = min(y1, 1540)
    crop = sheet.crop((max(0, x0 - 12), y0, min(sheet.width, x1 + 13), y1))
    diff = ImageChops.difference(crop, Image.new("RGB", crop.size, "white")).convert("L")
    bounds = diff.point(lambda value: 255 if value > 12 else 0).getbbox()
    if not bounds:
        raise ValueError(f"Could not find visible logo artwork for {name}")
    pad = 14
    bounds = (max(0, bounds[0] - pad), max(0, bounds[1] - pad),
              min(crop.width, bounds[2] + pad), min(crop.height, bounds[3] + pad))
    logo = crop.crop(bounds)
    filename = f"partner-p01-{index + 1:02}.webp"
    logo.save(OUT / filename, "WEBP", lossless=True)
    records.append({
        "name": name,
        "logo": f"/api/catalogue-assets/{filename}",
        "width": logo.width,
        "height": logo.height,
        "sourcePdf": SOURCE.name,
        "page": 1,
        "file": str(OUT / filename),
        "filename": filename,
    })

# Keep the one Print Garage client logo the user confirmed from the previous set.
forest_art = {
    "name": "Forest Art & Fabrication",
    "logo": "/api/catalogue-assets/partner-p04-91.webp",
    "width": 165,
    "height": 72,
    "sourcePdf": "BRIMAS_PROFILE_PRINT_1791582547961.pdf",
    "page": 4,
}
brimas_media = {
    "name": "Brimas Media",
    "logo": "/api/catalogue-assets/partner-p01-24.webp",
    "width": 1144,
    "height": 1119,
    "sourcePdf": "BRIMAS_LOGO_1792069898126.ai",
    "page": 1,
}
site_records = [forest_art, brimas_media] + [
    {key: value for key, value in record.items() if key not in ("file", "filename")}
    for record in records
]
(OUT / "partners.json").write_text(json.dumps(site_records, indent=2) + "\n")
(OUT / "upload.json").write_text(json.dumps([
    {"file": record["file"], "filename": record["filename"]} for record in records
] + [{
    "file": str(OUT / "partner-p01-24.webp"),
    "filename": "partner-p01-24.webp",
}], indent=2) + "\n")
(OUT / "client-cuts.json").write_text(json.dumps(records, indent=2) + "\n")

preview = Image.new("RGB", (1050, 8 * 190), "white")
draw = ImageDraw.Draw(preview)
font = ImageFont.load_default()
for index, record in enumerate(records):
    logo = Image.open(record["file"]).convert("RGB")
    logo.thumbnail((310, 145))
    x, y = (index % 3) * 350, (index // 3) * 190
    preview.paste(logo, (x + (350 - logo.width) // 2, y + 5))
    draw.text((x + 10, y + 158), record["name"], fill="#222", font=font)
preview.save(OUT / "client-logo-review.jpg", quality=92)
print(f"Prepared {len(records)} full-color client logo cuts plus Forest Art & Fabrication.")
