"""Create temporary contact sheets from a dry-run candidate, never originals."""
import argparse
import concurrent.futures
import io
import json
from pathlib import Path

from PIL import Image, ImageDraw
from cloudinary import delivery_url, fetch_bytes


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("candidate", type=Path)
    parser.add_argument("--output", type=Path, required=True, help="Use an ignored .media-import folder or /tmp")
    args = parser.parse_args()
    assets = json.loads(args.candidate.read_text())["assets"]
    args.output.mkdir(parents=True, exist_ok=True)

    def preview(asset):
        url = delivery_url(asset["publicId"], asset["version"], asset["format"], 480)
        data, _ = fetch_bytes(url)
        with Image.open(io.BytesIO(data)) as image:
            return image.convert("RGB")

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        images = list(pool.map(preview, assets))
    for start in range(0, len(assets), 25):
        sheet = Image.new("RGB", (1250, 1500), "#eeeeee")
        draw = ImageDraw.Draw(sheet)
        for index in range(start, min(start + 25, len(assets))):
            x, y = (index - start) % 5 * 250, (index - start) // 5 * 300
            image = images[index]
            image.thumbnail((240, 245))
            sheet.paste(image, (x + (250 - image.width) // 2, y))
            draw.text((x + 5, y + 250), f'{index + 1}: {assets[index]["id"][:12]}', fill="black")
            draw.text((x + 5, y + 270), assets[index]["publicId"][-30:], fill="black")
        sheet.save(args.output / f"sheet-{start // 25 + 1}.jpg", quality=88)
    (args.output / "index.json").write_text(json.dumps([
        {"number": index + 1, "id": asset["id"], "publicId": asset["publicId"]}
        for index, asset in enumerate(assets)], indent=2) + "\n")
    print(f"Created review sheets for {len(assets)} assets; nothing has been published or uploaded.")


if __name__ == "__main__":
    main()