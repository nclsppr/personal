#!/usr/bin/env bash
# Regenerate the 1200x630 Projects social card from its versioned HTML template.
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_FILE="$PROJECT_ROOT/assets/img/projects/projects-social-card.jpg"
CHROME_BIN="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

if [[ ! -x "$CHROME_BIN" ]]; then
  echo "Chrome not found: $CHROME_BIN" >&2
  exit 1
fi

TEMP_DIR="$(mktemp -d)"
cleanup() { rm -r "$TEMP_DIR"; }
trap cleanup EXIT
PNG_FILE="$TEMP_DIR/projects-social-card.png"

"$CHROME_BIN" \
  --headless=new --disable-gpu \
  --window-size=1200,630 \
  --hide-scrollbars \
  --force-device-scale-factor=1 \
  --virtual-time-budget=8000 \
  --screenshot="$PNG_FILE" \
  "file://$PROJECT_ROOT/scripts/projects-og-template.html" >/dev/null 2>&1

/usr/bin/sips -s format jpeg -s formatOptions 90 "$PNG_FILE" --out "$OUTPUT_FILE" >/dev/null
echo "Generated $(basename "$OUTPUT_FILE") ($(stat -f %z "$OUTPUT_FILE") bytes)"
