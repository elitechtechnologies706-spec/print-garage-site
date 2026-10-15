#!/usr/bin/env python3
"""
Safe WordPress migration helper for Print Garage.

The script is read-only by default:
  1. Checks wp-content/uploads over FTPS and probes a real uploaded image URL.
  2. Runs WP-CLI search-replace in dry-run mode.

To apply changes, rerun with --apply and confirm by typing APPLY. Before changing
the database it exports a private backup outside the WordPress document root.
It uses WP-CLI (not raw SQL), which safely updates serialized WordPress values.
The GUID column is deliberately excluded.

Set FTP connection details in environment variables. Never put real credentials
in this source file or commit them:
  PG_FTP_HOST=YOUR_CPANEL_FTP_HOST
  PG_FTP_USER=YOUR_CPANEL_FTP_USERNAME
  PG_FTP_PASSWORD=                 # optional; prompts securely when interactive
  PG_FTP_UPLOADS_PATH=public_html/wp-content/uploads
  PG_FTP_USE_TLS=1                 # set to 0 only if the host does not support FTPS

Example:
  python3 scripts/printgarage_wp_migration.py --old-url https://OLD-HOST.example
  python3 scripts/printgarage_wp_migration.py --old-url https://OLD-HOST.example --apply

Run from the WordPress root, or pass --wp-path /path/to/wordpress. WP-CLI must
be installed and configured to read the site's wp-config.php.
"""

from __future__ import annotations

import argparse
import ftplib
import getpass
import os
import posixpath
import shutil
import ssl
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


NEW_SITE_URL = "https://printgarage.online"
IMAGE_EXTENSIONS = {
    ".avif", ".bmp", ".gif", ".ico", ".jpeg", ".jpg", ".png",
    ".svg", ".tif", ".tiff", ".webp",
}
MAX_REMOTE_ENTRIES = 100_000
MAX_SAMPLE_IMAGE_BYTES = 1


class MigrationError(RuntimeError):
    """An expected, user-correctable migration preflight or execution error."""


@dataclass
class UploadInventory:
    directories: list[str]
    images: list[str]
    other_files: int


def normalize_old_host(value: str) -> str:
    """Validate a domain or HTTP(S) URL and return its host without a path."""
    value = value.strip()
    if not value or value.upper() in {"YOUR-OLD-HOST", "YOUR-OLD-HOST.EXAMPLE"}:
        raise MigrationError("Provide the real previous host with --old-url.")
    candidate = value if "://" in value else f"https://{value}"
    parsed = urllib.parse.urlsplit(candidate)
    if parsed.scheme.lower() not in {"http", "https"}:
        raise MigrationError("--old-url must use http:// or https://.")
    if not parsed.hostname or parsed.username or parsed.password:
        raise MigrationError("--old-url must be a domain URL, not contain credentials.")
    if parsed.port is not None:
        raise MigrationError("--old-url should be the previous site domain without a port.")
    if parsed.path not in {"", "/"} or parsed.query or parsed.fragment:
        raise MigrationError("--old-url should contain only the previous site domain.")
    host = parsed.hostname.lower().rstrip(".")
    if host.endswith((".example", ".invalid", ".test")) or "YOUR" in host.upper():
        raise MigrationError("Replace the example --old-url with the real previous domain.")
    return host


def old_url_variants(old_host: str) -> list[str]:
    """Cover old HTTP and HTTPS URLs without touching the new canonical URL."""
    candidates = [f"https://{old_host}", f"http://{old_host}"]
    return [url for url in dict.fromkeys(candidates) if url != NEW_SITE_URL]


def validate_uploads_path(value: str) -> str:
    path = value.strip()
    if not path or "\r" in path or "\n" in path:
        raise MigrationError("PG_FTP_UPLOADS_PATH is empty or invalid.")
    normalized = posixpath.normpath(path)
    if ".." in normalized.split("/"):
        raise MigrationError("PG_FTP_UPLOADS_PATH cannot contain '..'.")
    if not normalized.rstrip("/").endswith("/wp-content/uploads"):
        raise MigrationError(
            "PG_FTP_UPLOADS_PATH must end in wp-content/uploads "
            "(for example public_html/wp-content/uploads)."
        )
    return normalized


def ftp_credentials() -> tuple[str, str, str, str, bool]:
    host = os.environ.get("PG_FTP_HOST", "").strip()
    username = os.environ.get("PG_FTP_USER", "").strip()
    password = os.environ.get("PG_FTP_PASSWORD", "")
    uploads_path = validate_uploads_path(
        os.environ.get("PG_FTP_UPLOADS_PATH", "public_html/wp-content/uploads")
    )
    use_tls = os.environ.get("PG_FTP_USE_TLS", "1").strip().lower() not in {"0", "false", "no"}

    if not host or host.upper() in {"YOUR_CPANEL_FTP_HOST", "FTP_HOST"}:
        raise MigrationError("Set PG_FTP_HOST to your cPanel FTP hostname.")
    if not username or username.upper() in {"YOUR_CPANEL_FTP_USERNAME", "FTP_USER"}:
        raise MigrationError("Set PG_FTP_USER to your cPanel FTP username.")
    if password.strip().upper() in {"YOUR_PASSWORD", "FTP_PASS", "CHANGE_ME"}:
        password = ""
    if not password:
        if not sys.stdin.isatty():
            raise MigrationError(
                "Set PG_FTP_PASSWORD in the environment when running non-interactively."
            )
        password = getpass.getpass("FTP password (input is hidden): ")
    if not password:
        raise MigrationError("An FTP password is required.")
    return host, username, password, uploads_path, use_tls


def connect_ftp(host: str, username: str, password: str, use_tls: bool) -> ftplib.FTP:
    if use_tls:
        ftp: ftplib.FTP = ftplib.FTP_TLS(
            context=ssl.create_default_context(),
            timeout=30,
        )
    else:
        print("WARNING: PG_FTP_USE_TLS=0; FTP credentials and traffic will not be encrypted.")
        ftp = ftplib.FTP(timeout=30)
    ftp.connect(host, 21)
    ftp.login(username, password)
    if isinstance(ftp, ftplib.FTP_TLS):
        ftp.prot_p()
    ftp.set_pasv(True)
    return ftp


def _safe_entry_name(name: str) -> str:
    if name in {"", ".", ".."} or "/" in name or "\r" in name or "\n" in name:
        raise MigrationError(f"FTP returned an unsafe directory entry: {name!r}")
    return name


def list_ftp_entries(ftp: ftplib.FTP, parent: str) -> list[tuple[str, str]]:
    """Return (name, type) pairs, falling back to NLST on older FTP servers."""
    try:
        entries = []
        for name, facts in ftp.mlsd(parent, facts=["type"]):
            if name in {".", ".."}:
                continue
            entries.append((_safe_entry_name(name), facts.get("type", "unknown").lower()))
        return entries
    except (AttributeError, ftplib.error_perm, ftplib.error_reply, NotImplementedError):
        pass

    current = ftp.pwd()
    entries = []
    for raw_name in ftp.nlst(parent):
        name = _safe_entry_name(posixpath.basename(raw_name.rstrip("/")))
        child = posixpath.join(parent, name)
        try:
            ftp.cwd(child)
            kind = "dir"
        except ftplib.error_perm:
            kind = "file"
        finally:
            ftp.cwd(current)
        entries.append((name, kind))
    return entries


def inspect_uploads(
    host: str,
    username: str,
    password: str,
    uploads_path: str,
    use_tls: bool,
) -> UploadInventory:
    ftp = connect_ftp(host, username, password, use_tls)
    directories = [uploads_path]
    images: list[str] = []
    other_files = 0
    visited: set[str] = set()
    stack = [uploads_path]
    seen_entries = 0
    try:
        while stack:
            parent = stack.pop()
            if parent in visited:
                continue
            visited.add(parent)
            for name, kind in list_ftp_entries(ftp, parent):
                seen_entries += 1
                if seen_entries > MAX_REMOTE_ENTRIES:
                    raise MigrationError(
                        f"Uploads contains more than {MAX_REMOTE_ENTRIES:,} entries; "
                        "stopping the scan."
                    )
                child = posixpath.join(parent, name)
                if kind in {"dir", "cdir", "pdir"}:
                    if kind == "dir":
                        directories.append(child)
                        stack.append(child)
                elif kind in {"file", "unknown"}:
                    if Path(name).suffix.lower() in IMAGE_EXTENSIONS:
                        images.append(child)
                    else:
                        other_files += 1
                # Symlinks and special entries are deliberately not followed.
    finally:
        try:
            ftp.quit()
        except ftplib.all_errors:
            ftp.close()

    return UploadInventory(
        directories=sorted(set(directories), key=lambda item: item.count("/"), reverse=True),
        images=sorted(set(images)),
        other_files=other_files,
    )


def probe_public_image(relative_upload_path: str) -> tuple[int | None, str]:
    relative = relative_upload_path
    if not relative.startswith("wp-content/uploads/"):
        marker = "/wp-content/uploads/"
        index = relative.find(marker)
        if index >= 0:
            relative = relative[index + 1 :]
        else:
            relative = f"wp-content/uploads/{relative.rsplit('/wp-content/uploads/', 1)[-1]}"
    relative_url = urllib.parse.quote(relative, safe="/")
    url = f"{NEW_SITE_URL}/{relative_url}"
    request = urllib.request.Request(
        url,
        headers={
            "Range": f"bytes=0-{MAX_SAMPLE_IMAGE_BYTES - 1}",
            "User-Agent": "PrintGarageMigrationCheck/1.0",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=12) as response:
            response.read(MAX_SAMPLE_IMAGE_BYTES)
            return response.status, url
    except urllib.error.HTTPError as error:
        return error.code, url
    except (urllib.error.URLError, TimeoutError, OSError) as error:
        return None, f"{url} ({error})"


def wp_command(wp_path: Path, arguments: list[str], *, capture: bool = False) -> subprocess.CompletedProcess[str]:
    command = ["wp", f"--path={wp_path}", *arguments]
    try:
        return subprocess.run(
            command,
            check=True,
            text=True,
            capture_output=capture,
        )
    except FileNotFoundError as error:
        raise MigrationError("WP-CLI ('wp') was not found in PATH.") from error
    except subprocess.CalledProcessError as error:
        details = (error.stderr or error.stdout or "").strip()
        raise MigrationError(
            f"WP-CLI command failed: {' '.join(command[1:])}"
            + (f"\n{details}" if details else "")
        ) from error


def validate_wp_installation(wp_path: Path) -> None:
    if not (wp_path / "wp-config.php").is_file():
        raise MigrationError(
            f"No wp-config.php found in {wp_path}. Run from the WordPress root "
            "or pass --wp-path."
        )
    if not shutil.which("wp"):
        raise MigrationError("WP-CLI ('wp') is not installed or not available in PATH.")
    wp_command(wp_path, ["core", "is-installed"], capture=True)


def search_replace_arguments(old_url: str, *, dry_run: bool) -> list[str]:
    arguments = [
        "search-replace",
        old_url,
        NEW_SITE_URL,
        "--all-tables-with-prefix",
        "--precise",
        "--skip-columns=guid",
        "--report-changed-only",
    ]
    if dry_run:
        arguments.append("--dry-run")
    return arguments


def dry_run_search_replacements(wp_path: Path, old_host: str) -> list[str]:
    variants = old_url_variants(old_host)
    if not variants:
        print("No URL replacement is needed; the old host is already the new canonical URL.")
    for old_url in variants:
        print(f"\nWP-CLI dry run: {old_url} -> {NEW_SITE_URL}")
        wp_command(wp_path, search_replace_arguments(old_url, dry_run=True))
    return variants


def create_private_db_backup(wp_path: Path) -> Path:
    backup_dir = Path(
        os.environ.get(
            "PG_DB_BACKUP_DIR",
            str(Path.home() / ".printgarage-wp-migration-backups"),
        )
    ).expanduser().resolve()
    if backup_dir == wp_path or wp_path in backup_dir.parents:
        raise MigrationError(
            "Database backup directory must be outside the WordPress document root."
        )
    public_roots = {
        ancestor
        for ancestor in (wp_path, *wp_path.parents)
        if ancestor.name.lower() in {"public_html", "www", "htdocs", "httpdocs"}
    }
    if any(backup_dir == root or root in backup_dir.parents for root in public_roots):
        raise MigrationError(
            "Database backup directory appears to be web-accessible; choose a private path."
        )
    backup_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.chmod(backup_dir, 0o700)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup_file = backup_dir / f"printgarage-wordpress-{stamp}.sql"
    old_umask = os.umask(0o077)
    try:
        wp_command(wp_path, ["db", "export", str(backup_file)])
    finally:
        os.umask(old_umask)
    if not backup_file.is_file() or backup_file.stat().st_size == 0:
        raise MigrationError("WP-CLI did not create a usable database backup.")
    os.chmod(backup_file, 0o600)
    return backup_file


def apply_upload_permissions(
    host: str,
    username: str,
    password: str,
    use_tls: bool,
    inventory: UploadInventory,
) -> None:
    ftp = connect_ftp(host, username, password, use_tls)
    failures: list[tuple[str, str]] = []
    try:
        for remote_file in inventory.images:
            try:
                ftp.sendcmd(f"SITE CHMOD 644 {remote_file}")
            except ftplib.all_errors as error:
                failures.append((remote_file, str(error)))
        for remote_dir in inventory.directories:
            try:
                ftp.sendcmd(f"SITE CHMOD 755 {remote_dir}")
            except ftplib.all_errors as error:
                failures.append((remote_dir, str(error)))
    finally:
        try:
            ftp.quit()
        except ftplib.all_errors:
            ftp.close()
    if failures:
        sample = "\n".join(f"  {path}: {reason}" for path, reason in failures[:10])
        more = f"\n  ... and {len(failures) - 10} more" if len(failures) > 10 else ""
        raise MigrationError(
            f"FTP could not set permissions on {len(failures)} paths. "
            f"Some paths may already have been updated:\n{sample}{more}"
        )
    print(
        f"Set 755 on {len(inventory.directories)} uploads directories and "
        f"644 on {len(inventory.images)} image files."
    )


def clear_wordpress_caches(wp_path: Path) -> None:
    wp_command(wp_path, ["cache", "flush"])
    wp_command(wp_path, ["transient", "delete", "--all"])
    litespeed = subprocess.run(
        ["wp", f"--path={wp_path}", "cli", "has-command", "litespeed-purge"],
        text=True,
        capture_output=True,
    )
    if litespeed.returncode == 0:
        wp_command(wp_path, ["litespeed-purge", "all"])
        print("Purged the LiteSpeed Cache plugin.")
    else:
        print(
            "WordPress object cache and transients were cleared. If LiteSpeed, "
            "hosting, or CDN cache is enabled, purge that cache in its control panel."
        )


def confirm_apply() -> None:
    if not sys.stdin.isatty():
        raise MigrationError(
            "--apply requires an interactive terminal so the change can be confirmed."
        )
    answer = input(
        f"\nThis will set upload permissions and update WordPress URLs to "
        f"{NEW_SITE_URL}. Type APPLY to continue: "
    )
    if answer.strip() != "APPLY":
        raise MigrationError("Confirmation did not match; no changes were applied.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Check Print Garage WordPress uploads and safely migrate old URLs."
    )
    parser.add_argument(
        "--old-url",
        required=True,
        help="Previous WordPress domain, with or without http(s), e.g. https://old.example",
    )
    parser.add_argument(
        "--wp-path",
        default=os.environ.get("PG_WP_PATH", "."),
        help="WordPress installation root (default: PG_WP_PATH or current directory).",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="After dry-run checks, request confirmation, back up the DB, and apply changes.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        old_host = normalize_old_host(args.old_url)
        wp_path = Path(args.wp_path).expanduser().resolve()
        validate_wp_installation(wp_path)
        host, username, password, uploads_path, use_tls = ftp_credentials()

        print(f"WordPress root: {wp_path}")
        print(f"Previous host: {old_host}")
        print(f"New canonical URL: {NEW_SITE_URL}")
        print(f"Checking FTP uploads at {uploads_path} ...")
        inventory = inspect_uploads(host, username, password, uploads_path, use_tls)
        print(
            f"Found {len(inventory.images)} image files, "
            f"{inventory.other_files} other files, and "
            f"{len(inventory.directories)} folders."
        )
        if inventory.images:
            for remote_image in inventory.images[:5]:
                relative = remote_image.split("/wp-content/uploads/", 1)[-1]
                status, url = probe_public_image(relative)
                if status is not None and 200 <= status < 300:
                    print(f"Image URL OK ({status}): {url}")
                else:
                    print(f"Image URL needs attention ({status or 'unreachable'}): {url}")
        else:
            print("WARNING: No image files were found in the FTP uploads folder.")

        variants = dry_run_search_replacements(wp_path, old_host)
        if not args.apply:
            print(
                "\nDry run complete. No files, permissions, database rows, or caches "
                "were changed. Review the output, then rerun with --apply to continue."
            )
            return 0
        if not inventory.images:
            raise MigrationError(
                "Refusing to apply while the uploads folder contains no images. "
                "Restore wp-content/uploads first, then rerun."
            )

        confirm_apply()
        backup_file = create_private_db_backup(wp_path)
        print(f"Database backup saved privately to: {backup_file}")
        apply_upload_permissions(host, username, password, use_tls, inventory)

        for old_url in variants:
            print(f"\nUpdating {old_url} -> {NEW_SITE_URL}")
            wp_command(wp_path, search_replace_arguments(old_url, dry_run=False))

        clear_wordpress_caches(wp_path)
        home = wp_command(wp_path, ["option", "get", "home"], capture=True).stdout.strip()
        siteurl = wp_command(wp_path, ["option", "get", "siteurl"], capture=True).stdout.strip()
        print(f"WordPress home: {home}")
        print(f"WordPress siteurl: {siteurl}")
        if home != NEW_SITE_URL or siteurl != NEW_SITE_URL:
            print(
                "WARNING: home/siteurl did not both resolve to the new URL. "
                "Check WP_HOME/WP_SITEURL constants in wp-config.php."
            )
        if inventory.images:
            relative = inventory.images[0].split("/wp-content/uploads/", 1)[-1]
            status, url = probe_public_image(relative)
            if status is not None and 200 <= status < 300:
                print(f"Post-fix image URL OK ({status}): {url}")
            else:
                print(
                    f"Post-fix image URL still needs attention "
                    f"({status or 'unreachable'}): {url}"
                )
        print(
            "\nMigration steps completed. Purge any external hosting/CDN cache if "
            "your provider manages one separately."
        )
        return 0
    except (MigrationError, OSError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    except ftplib.all_errors as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
