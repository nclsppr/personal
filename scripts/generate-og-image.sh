#!/usr/bin/env bash
# Régénère la miniature de partage og-home.png (1200x630) à partir du gabarit
# scripts/og-template.html (Chrome headless, capture d'écran).
#
# À relancer dès que l'identité visible change : logo, accent, titre, rôle,
# tagline ou métriques phares. Voir AGENTS.md.
#
# Usage : scripts/generate-og-image.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/assets/img/og-home.png"

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
if [[ ! -x "$CHROME" ]]; then
  echo "⛔ Chrome introuvable ($CHROME). Définis CHROME=/chemin/vers/chrome." >&2
  exit 1
fi

echo "Régénération de la miniature og-home.png…"
"$CHROME" \
  --headless=new --disable-gpu \
  --window-size=1200,630 \
  --hide-scrollbars \
  --force-device-scale-factor=1 \
  --virtual-time-budget=8000 \
  --screenshot="$OUT" \
  "file://$ROOT/scripts/og-template.html" >/dev/null 2>&1

echo "  ✓ $(basename "$OUT") ($(stat -f %z "$OUT") octets)"
echo "Terminé. Pense à l'inclure dans le même commit que le changement d'identité."
