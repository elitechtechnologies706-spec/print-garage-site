"""Extract complete original-color partner cards from the supplied corporate profile."""
from pathlib import Path
import json
import pymupdf
from PIL import Image, ImageChops, ImageDraw

SOURCE = Path("attached_assets/BRIMAS_PROFILE_PRINT_1791582547961.pdf")
PARTNER_NAMES = [name.strip() for name in """
USAID|REBUILD|PATH|Rotary Club of Kampala North|Walimu|Mercy Corps|ISER|Aga Khan Foundation|Kulea Watoto|PlayMatters|
World Health Organization|ACORD|NURI|Medical Teams International|Uganda Healthcare Federation|International Rescue Committee|UK aid|War Child|U-Learn|Action Against Hunger|
KCB|Tropical Bank|dfcu Bank|Housing Finance Bank|EFC|Centenary Bank|UBA|Uganda Development Bank|Absa|FINCA|
ABC Capital Bank|Cairo Bank Uganda|Pride Microfinance|Opportunity Bank|Sourcing|UNOC|Mota-Engil|TotalEnergies|Rubis|Tilenga MOOC|
Oryx Energies|VOGE|MTAC East Africa|Isuzu|Old Mutual|Clarkson|Letshego|BDO|XENO|NIC General Insurance|
Jubilee|NSSF|Uganda Wildlife Authority|National Drug Authority|Uganda Bureau of Statistics|FUFA|Posta Uganda|Insurance Regulatory Authority|Uganda Communications Commission|Bank of Uganda|
PIBID|National Enterprise Corporation|Uganda Road Fund|Purple-and-gold institutional partner emblem|Uganda National Roads Authority|Steel & Tube|Coca-Cola Beverages Africa|Rwenzori Bottling Company|Balton Uganda|Uganda coat of arms|
Cina Butchery|National Medical Stores|Buildnet|NxtRadio|MTN|Papa Foods|ICEA LION Group|Saachi|Print Garage|Sheraton|
Rocket Health|Yamaha|Lancet Laboratories Uganda|NBS|Forest Rally Team|CHINT Electric|Ericsson|K2 Telecom|Tuli Wamu Nawe|UG-Rides|
Forest Art & Fabrication|Lake Victoria Hotel Limited|SGA Security|Aga Khan Foundation|Peacock Paints
""".split("|")]
assert len(PARTNER_NAMES) == 95
OUT = Path("generated-artifacts/partners")
OUT.mkdir(parents=True, exist_ok=True)
doc = pymupdf.open(SOURCE)
page = doc[3]
page.get_pixmap(matrix=pymupdf.Matrix(1.6, 1.6), alpha=False).save(OUT / "partners-page.png")

def group(rect):
    if rect.y0 > 450:
        return 5
    if rect.x0 < 210:
        return 0
    if rect.x0 < 415:
        return 1
    if rect.x0 < 640:
        return 2 if rect.y0 < 350 else 3
    return 4

rects = []
for drawing in page.get_drawings():
    rect = drawing["rect"]
    if (16 < rect.width < 105 and 15 < rect.height < 60 and rect.y0 > 170
            and drawing["fill"] is None and drawing["color"] and len(drawing["items"]) == 1):
        rects.append(rect)
rects.sort(key=lambda rect: (group(rect), round(rect.y0 / 12), rect.x0))
assert len(rects) == 95, f"Expected the 95 source partner cards, got {len(rects)}"

records = []
sheet = Image.new("RGB", (1400, 1100), "white")
draw = ImageDraw.Draw(sheet)
for index, rect in enumerate(rects, 1):
    inset = pymupdf.Rect(rect.x0 + .65, rect.y0 + .65, rect.x1 - .65, rect.y1 - .65)
    pix = page.get_pixmap(matrix=pymupdf.Matrix(4, 4), clip=inset, alpha=False)
    image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    difference = ImageChops.difference(image, Image.new("RGB", image.size, "white"))
    bounds = difference.point(lambda value: 255 if value > 8 else 0).getbbox()
    if bounds:
        image = image.crop(bounds)
    filename = f"partner-p04-{index:02}.webp"
    image.save(OUT / filename, "WEBP", lossless=True)
    records.append({
        "index": index, "group": group(rect), "filename": filename,
        "file": str(OUT / filename), "width": image.width, "height": image.height,
        "sourcePdf": SOURCE.name, "page": 4, "rect": list(rect),
    })
    thumbnail = image.copy()
    thumbnail.thumbnail((122, 82))
    x, y = ((index - 1) % 10) * 140, ((index - 1) // 10) * 110
    sheet.paste(thumbnail, (x + (140 - thumbnail.width) // 2, y + 4))
    draw.text((x + 8, y + 88), str(index), fill="black")
sheet.save(OUT / "partner-review.jpg", quality=95)
(OUT / "cuts.json").write_text(json.dumps(records, indent=2))
partners = []
uploads = []
for record, name in zip(records, PARTNER_NAMES):
    # This is now the Print Garage site; omit its own mark and the repeated Aga Khan card.
    if record["index"] in (79, 94):
        continue
    partners.append({
        "name": name, "logo": f"/api/catalogue-assets/{record['filename']}",
        "width": record["width"], "height": record["height"],
        "sourcePdf": SOURCE.name, "page": 4,
    })
    uploads.append({"file": record["file"], "filename": record["filename"]})
(OUT / "upload.json").write_text(json.dumps(uploads, indent=2))
Path("artifacts/brimas-media/src/lib/print-garage-partners.json").write_text(json.dumps(partners, indent=2) + "\n")
print(f"Extracted {len(records)} complete partner cards from profile page 4.")
print(f"Prepared {len(partners)} unique external partner logos for the site.")
