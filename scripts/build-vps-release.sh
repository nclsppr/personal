#!/usr/bin/env bash

set -Eeuo pipefail

REPOSITORY_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
readonly REPOSITORY_ROOT

usage() {
  echo "usage: build-vps-release <output-directory> [git-revision]" >&2
  exit 64
}

[[ $# -ge 1 && $# -le 2 ]] || usage

output_directory=$1
revision=${2:-HEAD}
resolved_revision=$(git -C "$REPOSITORY_ROOT" rev-parse --verify "${revision}^{commit}")
[[ $resolved_revision =~ ^[0-9a-f]{40}$ ]] || {
  echo "revision must resolve to a complete lowercase Git commit" >&2
  exit 1
}

readonly resolved_revision
readonly output_directory
temporary_directory=$(mktemp -d "${TMPDIR:-/tmp}/personal-vps-release.XXXXXX")
readonly temporary_directory

cleanup() {
  rm -rf -- "$temporary_directory"
}
trap cleanup EXIT HUP INT TERM

public_paths=(
  400.html
  401.html
  403.html
  404.html
  410.html
  429.html
  500.html
  502.html
  503.html
  504.html
  BingSiteAuth.xml
  assets
  blog
  claude
  cv
  dashboard
  fr
  index.html
  llms.txt
  robots.txt
  sitemap.xml
  v2022
  work
)

mkdir -p "$output_directory" "$temporary_directory/extracted"

git -C "$REPOSITORY_ROOT" archive \
  --format=tar \
  --prefix=site/ \
  "$resolved_revision" \
  -- "${public_paths[@]}" >"$temporary_directory/site.tar"

tar -xf "$temporary_directory/site.tar" -C "$temporary_directory/extracted"

PERSONAL_RELEASE_ROOT="$temporary_directory/extracted/site" \
PERSONAL_RELEASE_REVISION="$resolved_revision" \
PERSONAL_RELEASE_ARCHIVE="$output_directory/site.tar.gz" \
PERSONAL_RELEASE_INVENTORY="$output_directory/routes.json" \
python3 - <<'PY'
from __future__ import annotations

import gzip
import hashlib
import json
import os
import stat
from pathlib import Path
from urllib.parse import quote

root = Path(os.environ["PERSONAL_RELEASE_ROOT"])
revision = os.environ["PERSONAL_RELEASE_REVISION"]
archive = Path(os.environ["PERSONAL_RELEASE_ARCHIVE"])
inventory = Path(os.environ["PERSONAL_RELEASE_INVENTORY"])

if not root.is_dir():
    raise SystemExit("site archive did not produce a site directory")

files: list[Path] = []
total_size = 0
for path in sorted(root.rglob("*")):
    mode = path.lstat().st_mode
    if stat.S_ISDIR(mode):
        continue
    if not stat.S_ISREG(mode):
        raise SystemExit(f"public archive contains a non-regular file: {path.relative_to(root)}")
    files.append(path)
    total_size += path.stat().st_size

if not files:
    raise SystemExit("public archive is empty")
if len(files) > 2000:
    raise SystemExit("public archive exceeds the 2000-file limit")
if total_size > 100 * 1024 * 1024:
    raise SystemExit("public archive exceeds the 100 MiB uncompressed limit")

with open(archive, "wb") as raw_output:
    with gzip.GzipFile(filename="", mode="wb", fileobj=raw_output, mtime=0) as compressed:
        with open(Path(os.environ["PERSONAL_RELEASE_ROOT"]).parent.parent / "site.tar", "rb") as source:
            while chunk := source.read(1024 * 1024):
                compressed.write(chunk)

archive_size = archive.stat().st_size
if archive_size > 50 * 1024 * 1024:
    raise SystemExit("public archive exceeds the 50 MiB compressed limit")

routes = []
seen_routes: set[str] = set()
for path in files:
    relative = path.relative_to(root).as_posix()
    if relative == "index.html":
        route = "/"
    elif relative.endswith("/index.html"):
        route = "/" + relative.removesuffix("index.html")
    else:
        route = "/" + relative
    route = quote(route, safe="/-._~")
    if route in seen_routes:
        raise SystemExit(f"duplicate public route: {route}")
    seen_routes.add(route)
    routes.append(
        {
            "bytes": path.stat().st_size,
            "file": relative,
            "path": route,
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            "status": 200,
        }
    )

value = {
    "contract": "vps-infra.route-inventory.v1",
    "schema": 1,
    "site": {
        "archive_bytes": archive_size,
        "archive_sha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
        "file_count": len(files),
        "uncompressed_bytes": total_size,
    },
    "source": {
        "repository": "nclsppr/personal",
        "revision": revision,
    },
    "routes": routes,
}
inventory.write_text(
    json.dumps(value, ensure_ascii=True, separators=(",", ":"), sort_keys=True) + "\n",
    encoding="ascii",
)
PY

printf 'revision=%s\n' "$resolved_revision"
printf 'site_archive=%s\n' "$output_directory/site.tar.gz"
printf 'route_inventory=%s\n' "$output_directory/routes.json"
