"""Render and trim the uploaded Brimas Media Illustrator logo."""
from pathlib import Path

import pymupdf
from PIL import Image, ImageChops

SOURCE = Path("attached_assets/BRIMAS_LOGO_1792069898126.ai")
OUT = Path("generated-artifacts/partners-clients")
OUT.mkdir(parents=True, exist_ok=True)

document = pymupdf.open(SOURCE)
if len(document) != 1:
    raise ValueError(f"Expected a one-page logo file, got {len(document)} pages")
page = document[0]
pix = page.get_pixmap(matrix=pymupdf.Matrix(4, 4), alpha=False)
image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
difference = ImageChops.difference(image, Image.new("RGB", image.size, "white"))
bounds = difference.convert("L").point(lambda value: 255 if value > 10 else 0).getbbox()
if not bounds:
    raise ValueError("No visible Brimas Media artwork found")
pad = 18
bounds = (max(0, bounds[0] - pad), max(0, bounds[1] - pad),
          min(image.width, bounds[2] + pad), min(image.height, bounds[3] + pad))
logo = image.crop(bounds)
logo.save(OUT / "partner-p01-24.webp", "WEBP", lossless=True)
logo.save(OUT / "brimas-media-logo-review.png")
(OUT / "brimas-media-logo.svg").write_text(page.get_svg_image())
print(f"Prepared Brimas Media logo, {logo.width}x{logo.height}, from the uploaded Illustrator PDF.")
