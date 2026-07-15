#!/usr/bin/env python3
"""PreToolUse(Bash) hook — bloque `git commit` quand une page CV est modifiée
sans que le PDF téléchargeable correspondant ne soit régénéré dans le même commit.

Les PDF liés depuis /cv/ et /fr/cv/ sont un rendu d'impression de ces pages.
Si on touche cv/index.html ou fr/cv/index.html mais qu'on ne (re)stage pas le
PDF associé, le PDF téléchargé devient obsolète par rapport à la page HTML —
d'où le blocage, avec la commande pour régénérer.

Ne s'active que dans le dépôt qui contient index.html + fr/index.html ; inerte
partout ailleurs (aucun chemin en dur, comme check-i18n-parity.py)."""
import sys, json, os, re, subprocess

# Page CV → PDF téléchargeable qu'elle référence.
CV_PAGES = {
    "cv/index.html": "assets/docs/nicolas-pieper-cv-en.pdf",
    "fr/cv/index.html": "assets/docs/nicolas-pieper-cv-fr.pdf",
}


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    cmd = ((data.get("tool_input") or {}).get("command") or "")
    if "git" not in cmd or "commit" not in cmd:
        sys.exit(0)

    candidates = []
    m = re.search(r'-C\s+(\S+)', cmd)
    if m:
        candidates.append(m.group(1))
    candidates.append(os.getcwd())

    repo = None
    for c in candidates:
        try:
            out = subprocess.run(["git", "-C", c, "rev-parse", "--show-toplevel"],
                                 capture_output=True, text=True, timeout=5)
        except Exception:
            continue
        if out.returncode != 0:
            continue
        top = out.stdout.strip()
        if (os.path.isfile(os.path.join(top, "index.html"))
                and os.path.isfile(os.path.join(top, "fr", "index.html"))):
            repo = top
            break

    if not repo:
        sys.exit(0)  # pas le dépôt du site bilingue → ne rien faire

    # Fichiers effectivement en cours de commit (index / staged).
    try:
        staged = subprocess.run(
            ["git", "-C", repo, "diff", "--cached", "--name-only"],
            capture_output=True, text=True, timeout=5).stdout.split()
    except Exception:
        sys.exit(0)
    staged = set(staged)

    errors = []
    for page, pdf in CV_PAGES.items():
        if page in staged and pdf not in staged:
            errors.append("{} modifié mais {} non régénéré/stagé.".format(page, pdf))

    if errors:
        sys.stderr.write("⛔ CV PDF obsolète — commit bloqué :\n")
        for e in errors:
            sys.stderr.write("  • " + e + "\n")
        sys.stderr.write(
            "\nRégénère les PDF puis stage-les dans le même commit :\n"
            "  ./scripts/generate-cv-pdf.sh\n"
            "  git add assets/docs/nicolas-pieper-cv-*.pdf\n")
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
