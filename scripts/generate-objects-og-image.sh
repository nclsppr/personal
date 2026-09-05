#!/usr/bin/env bash
# Render both localized social images with the actual collection assets.
set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHROME_BIN="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
for lang in en fr; do
  "$CHROME_BIN" --headless=new --disable-gpu --window-size=1200,630 \
    --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=8000 \
    --screenshot="$PROJECT_ROOT/assets/img/objects/og-objects-$lang.png" \
    "file://$PROJECT_ROOT/scripts/objects-og-template.html?lang=$lang" >/dev/null 2>&1
  echo "Generated assets/img/objects/og-objects-$lang.png"
done
