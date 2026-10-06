"""Public delivery validation only: no Admin API, credentials or upload operations."""
import hashlib
import io
import json
import re
from urllib.parse import quote, unquote, urlparse
from urllib.request import Request, urlopen

from PIL import Image

CLOUD = "zjzxwgcq"
ROOT = f"https://res.cloudinary.com/{CLOUD}/image/upload"
MAX_IMAGE_BYTES = 8 * 1024 * 1024


def source_version(row):
    url = urlparse(row["url"])
    if (url.scheme != "https" or url.netloc != "res.cloudinary.com"
            or url.username or url.password or url.query or url.fragment):
        raise ValueError("Expected credential-free public Cloudinary HTTPS URL")
    match = re.fullmatch(rf"/{CLOUD}/image/upload/v(\d+)/(.+)\.([a-z0-9]+)", url.path)
    if not match or unquote(match[2]) != row["publicId"] or match[3] != row["format"]:
        raise ValueError("URL does not match the approved cloud, public ID or format")
    if any(part in ("", ".", "..") for part in row["publicId"].split("/")):
        raise ValueError("Unsafe public ID")
    if row.get("assetType") != "image" or row.get("deliveryType") != "upload":
        raise ValueError("Only public image/upload assets are supported")
    if row.get("moderationStatus", "").lower() in ("rejected", "pending"):
        raise ValueError("Moderation is not approved")
    if not re.fullmatch(r"[a-f0-9]{32}", row["assetId"]):
        raise ValueError("Missing or invalid stable Cloudinary asset ID")
    return int(match[1])


def delivery_url(public_id, version, format, width=None):
    transform = (f"c_limit,w_{width}/" if width else "") + "f_auto/q_auto"
    public_id = "/".join(quote(part, safe="") for part in public_id.split("/"))
    return f"{ROOT}/{transform}/v{version}/{public_id}.{format}"


def fetch_bytes(url, limit=MAX_IMAGE_BYTES):
    request = Request(url, headers={"Accept": "image/jpeg", "User-Agent": "BrimasImageCatalog/1.0"})
    with urlopen(request, timeout=35) as response:
        if urlparse(response.url).netloc != "res.cloudinary.com":
            raise ValueError("Unexpected public delivery redirect")
        content_type = response.headers.get("Content-Type", "")
        data = response.read(limit + 1)
        if len(data) > limit:
            raise ValueError("Public image exceeds the verification byte limit")
        return data, content_type


def intrinsic_dimensions(row, version):
    public_id = "/".join(quote(part, safe="") for part in row["publicId"].split("/"))
    url = f'{ROOT}/fl_getinfo/v{version}/{public_id}.{row["format"]}'
    data, _ = fetch_bytes(url, 256 * 1024)
    info = json.loads(data)["input"]
    width, height = int(info["width"]), int(info["height"])
    if width <= 0 or height <= 0:
        raise ValueError("Missing intrinsic dimensions")
    return width, height, int(info["bytes"])


def verify_image(url):
    data, content_type = fetch_bytes(url)
    if not content_type.startswith("image/"):
        raise ValueError(f"Public delivery returned {content_type}, not an image")
    with Image.open(io.BytesIO(data)) as image:
        image.load()
        width, height = image.size
        # Detect identical rendered pixels rather than relying on filenames.
        digest = hashlib.sha256(image.convert("RGB").tobytes()).hexdigest()
    return {"url": url, "width": width, "height": height, "bytes": len(data),
            "pixelSha256": digest}


def verify_asset(row):
    version = source_version(row)
    width, height, original_bytes = intrinsic_dimensions(row, version)
    primary = verify_image(delivery_url(row["publicId"], version, row["format"], min(width, 1200)))
    if primary["width"] != min(width, 1200):
        raise ValueError("Primary delivery width differs from the declared width")
    if abs(primary["height"] / primary["width"] - height / width) > 2 / primary["width"]:
        raise ValueError("Primary delivery aspect ratio differs from the original")
    variants = []
    for size in (320, 480, 800):
        if size >= primary["width"]:
            continue
        variant = verify_image(delivery_url(row["publicId"], version, row["format"], size))
        if variant["width"] != size:
            raise ValueError("Responsive variant width mismatch")
        if abs(variant["height"] / variant["width"] - height / width) > 2 / size:
            raise ValueError("Responsive variant aspect ratio mismatch")
        variants.append(variant)
    def metadata_value(name, default):
        raw = row.get(name, "")
        if not raw:
            return default
        try:
            return json.loads(raw)
        except (ValueError, TypeError):
            return raw

    return {
        "id": row["assetId"], "publicId": row["publicId"], "version": version,
        "format": row["format"], "originalUrl": row["url"],
        "filename": row["filename"], "displayName": row.get("displayName", row["filename"]),
        "assetFolder": row.get("assetFolder", ""), "folder": row.get("folder", ""),
        "tags": metadata_value("tags", []), "context": metadata_value("context", {}),
        "metadata": metadata_value("metadata", {}), "createdAt": row.get("createdAt", ""),
        "width": width, "height": height, "originalBytes": original_bytes,
        "delivery": primary, "variants": variants,
    }