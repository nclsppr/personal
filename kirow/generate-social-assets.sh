#!/usr/bin/env bash
# Render localized social cards from the exact published model preview.
set -euo pipefail
KIROW_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$KIROW_ROOT/render-social-assets.mjs"
