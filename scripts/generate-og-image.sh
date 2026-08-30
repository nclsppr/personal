#!/usr/bin/env bash
# Régénère les cartes de partage principales (1200x630) depuis og-template.html.
set -euo pipefail

SITE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHROME_BIN="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

if [[ ! -x "$CHROME_BIN" ]]; then
  echo "Chrome introuvable: $CHROME_BIN" >&2
  exit 1
fi

TEMP_DIR="$(mktemp -d)"
cleanup() { rm -r "$TEMP_DIR"; }
trap cleanup EXIT

render_card() {
  local page="$1"
  local lang="$2"
  local output="$3"
  local filename="${output##*/}"
  local temporary_output="$TEMP_DIR/$filename"
  "$CHROME_BIN" \
    --headless=new --disable-gpu \
    --window-size=1200,630 \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --virtual-time-budget=8000 \
    --screenshot="$temporary_output" \
    "file://$SITE_ROOT/scripts/og-template.html?page=$page&lang=$lang" >/dev/null 2>&1
  echo "Rendered $output ($(stat -f %z "$temporary_output") bytes)"
}

publish_card() {
  local output="$1"
  local filename="${output##*/}"
  mv "$TEMP_DIR/$filename" "$SITE_ROOT/$output"
  echo "Published $output"
}

render_card home en assets/img/og-home.png
render_card home fr assets/img/og-home-fr.png
render_card work en assets/img/og-work.png
render_card work fr assets/img/og-work-fr.png
render_card cv en assets/img/og-cv.png
render_card cv fr assets/img/og-cv-fr.png
render_card blog en assets/img/og-blog.png
render_card blog fr assets/img/og-blog-fr.png
render_card claude fr assets/img/og-claude.png
render_card roadtrip fr assets/img/og-roadtrip.png

publish_card assets/img/og-home.png
publish_card assets/img/og-home-fr.png
publish_card assets/img/og-work.png
publish_card assets/img/og-work-fr.png
publish_card assets/img/og-cv.png
publish_card assets/img/og-cv-fr.png
publish_card assets/img/og-blog.png
publish_card assets/img/og-blog-fr.png
publish_card assets/img/og-claude.png
publish_card assets/img/og-roadtrip.png
