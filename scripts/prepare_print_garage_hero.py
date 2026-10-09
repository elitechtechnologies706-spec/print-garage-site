"""Optimize the illustrative service-delivery background and prepare durable upload."""
from pathlib import Path
import json
from PIL import Image, ImageOps

output = Path("generated-artifacts/hero")
image = ImageOps.exif_transpose(Image.open(output / "printing-services.jpg")).convert("RGB")
# Preserve machinery and people without stretching when generation returns a square.
# Extend only the quiet left wall/floor edge to provide a natural copy area.
wide_width = max(image.width, round(image.height * 1.8))
if wide_width > image.width:
    background = image.crop((0, 0, 1, image.height)).resize((wide_width, image.height))
    background.paste(image, (wide_width - image.width, 0))
    image = background
image.thumbnail((1800, 1100))
filename = "hero-p01-01.webp"
image.save(output / filename, "WEBP", quality=86, method=6)
metadata = {
    "image": f"/api/catalogue-assets/{filename}",
    "width": image.width,
    "height": image.height,
    "alt": "Illustrative printing and branding workshop with a wide-format printer, garment heat press and corporate gifts",
}
Path("artifacts/brimas-media/src/lib/print-garage-hero.json").write_text(json.dumps(metadata, indent=2) + "\n")
(output / "upload.json").write_text(json.dumps([{"file": str(output / filename), "filename": filename}]))
print(f"Prepared {image.width}x{image.height} hero background; {(output / filename).stat().st_size} bytes.")
