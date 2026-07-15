#!/usr/bin/env bash
# Régénère les PDF du CV (FR + EN) à partir des pages HTML servies localement.
#
# Les PDF liés depuis /cv/ et /fr/cv/ sont un rendu d'impression des pages
# elles-mêmes (Chrome headless applique @media print / @page de cv.css). Dès
# qu'on touche à cv/index.html ou fr/cv/index.html, il faut relancer ce script
# pour que les PDF téléchargeables restent fidèles. Voir AGENTS.md § « CV PDF ».
#
# Usage : scripts/generate-cv-pdf.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT/assets/docs"

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
if [[ ! -x "$CHROME" ]]; then
  echo "⛔ Chrome introuvable ($CHROME). Définis CHROME=/chemin/vers/chrome." >&2
  exit 1
fi

PORT="${PORT:-8123}"
BASE="http://localhost:$PORT"

# Serveur statique éphémère (les pages référencent /assets/... en absolu, donc
# file:// ne suffit pas — il faut un vrai serveur HTTP à la racine du dépôt).
python3 -m http.server "$PORT" --directory "$ROOT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER_PID=$!
cleanup() { kill "$SERVER_PID" 2>/dev/null || true; }
trap cleanup EXIT

# Attendre que le serveur réponde.
for _ in $(seq 1 50); do
  if python3 -c "import urllib.request,sys; urllib.request.urlopen('$BASE/cv/')" 2>/dev/null; then
    break
  fi
  sleep 0.1
done

render() {
  local url="$1" out="$2"
  "$CHROME" \
    --headless=new --disable-gpu \
    --no-pdf-header-footer \
    --run-all-compositor-stages-before-draw \
    --virtual-time-budget=8000 \
    --print-to-pdf="$out" \
    "$url" >/dev/null 2>&1
  echo "  ✓ $(basename "$out")"
}

echo "Régénération des PDF du CV…"
render "$BASE/cv/"    "$OUT_DIR/nicolas-pieper-cv-en.pdf"
render "$BASE/fr/cv/" "$OUT_DIR/nicolas-pieper-cv-fr.pdf"
echo "Terminé. Pense à les inclure dans le même commit que les pages CV."
