#!/usr/bin/env bash
# Regenerate the 1200x630 Projects social card from its versioned HTML template.
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHROME_BIN="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

if [[ ! -x "$CHROME_BIN" ]]; then
  echo "Chrome not found: $CHROME_BIN" >&2
  exit 1
fi

TEMP_DIR="$(mktemp -d)"
cleanup() { rm -r "$TEMP_DIR"; }
trap cleanup EXIT
render_card() {
  local lang="$1"
  local output="$2"
  local png_file="$TEMP_DIR/projects-social-card-$lang.png"
  "$CHROME_BIN" \
    --headless=new --disable-gpu \
    --window-size=1200,630 \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --virtual-time-budget=8000 \
    --screenshot="$png_file" \
    "file://$PROJECT_ROOT/scripts/projects-og-template.html?lang=$lang" >/dev/null 2>&1

  /usr/bin/sips -s format jpeg -s formatOptions 90 "$png_file" --out "$PROJECT_ROOT/$output" >/dev/null
  echo "Generated $output ($(stat -f %z "$PROJECT_ROOT/$output") bytes)"
}

render_card en assets/img/projects/projects-social-card.jpg
render_card fr assets/img/projects/projects-social-card-fr.jpg
