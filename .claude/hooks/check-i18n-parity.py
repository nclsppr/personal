#!/usr/bin/env python3
"""PreToolUse(Bash) hook - bloque `git commit` sur le site perso bilingue
tant que les paires de pages EN et FR ne sont pas structurellement synchronisées.
Garantit la « règle de parité FR/EN » avant chaque commit.

Ne se déclenche que dans le dépôt qui contient index.html + fr/index.html ;
inerte partout ailleurs. La parité *sémantique* (chaque texte bien traduit)
reste à la charge de l'IA - ce script en émet le rappel."""
import sys, json, os, re, subprocess


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    cmd = ((data.get("tool_input") or {}).get("command") or "")
    if "git" not in cmd or "commit" not in cmd:
        sys.exit(0)

    # Résoudre la racine du dépôt visé : -C <path> dans la commande, sinon cwd.
    # Aucun chemin en dur : le hook ne s'active que si le dépôt réellement visé
    # contient index.html + fr/index.html (donc inerte pour tout autre dépôt).
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

    def read(p):
        with open(p, encoding="utf-8") as f:
            return f.read()

    section_ids = lambda h: set(re.findall(r'<section[^>]*\bid="([a-z0-9-]+)"', h))
    nav_anchors = lambda h: set(re.findall(r'href="(#[a-z0-9-]+)"', h))

    errors = []

    def crumb(h):
        mm = re.search(r'<nav class="breadcrumb[^"]*".*?<span aria-current="page">([^<]*)</span>', h, re.S)
        return mm.group(1).strip() if mm else None

    pairs = (
        ("index.html", "fr/index.html"),
        ("projects/index.html", "fr/projects/index.html"),
        ("objects/index.html", "fr/objects/index.html"),
    )
    for en_path, fr_path in pairs:
        en_full = os.path.join(repo, en_path)
        fr_full = os.path.join(repo, fr_path)
        if not os.path.isfile(en_full) or not os.path.isfile(fr_full):
            errors.append("Paire bilingue manquante: {} | {}".format(en_path, fr_path))
            continue
        en = read(en_full)
        fr = read(fr_full)

        en_ids, fr_ids = section_ids(en), section_ids(fr)
        if en_ids != fr_ids:
            errors.append("Sections désynchronisées ({} | {}) - EN seulement: {} | FR seulement: {}".format(
                en_path, fr_path, sorted(en_ids - fr_ids) or "-", sorted(fr_ids - en_ids) or "-"))

        en_nav, fr_nav = nav_anchors(en), nav_anchors(fr)
        if en_nav != fr_nav:
            errors.append("Ancres de nav désynchronisées ({} | {}) - EN seulement: {} | FR seulement: {}".format(
                en_path, fr_path, sorted(en_nav - fr_nav) or "-", sorted(fr_nav - en_nav) or "-"))

        fr_crumb = crumb(fr)
        if fr_crumb in ("fr", "en", None):
            errors.append('Fil d’Ariane FR suspect dans {}: "{}".'.format(fr_path, fr_crumb))

        if not re.search(r'<html[^>]*\blang="fr"', fr):
            errors.append('{}: attribut lang="fr" manquant sur <html>.'.format(fr_path))

    if errors:
        sys.stderr.write("⛔ Parité FR/EN - commit bloqué. Corrige puis recommite :\n")
        for e in errors:
            sys.stderr.write("  • " + e + "\n")
        sys.stderr.write("\nEt vérifie la parité sémantique : chaque texte de fr/ = la traduction "
                         "équivalente de en/ (aucun texte source oublié, aucun placeholder).\n")
        sys.exit(2)

    sys.stderr.write("✅ Parité structurelle FR/EN OK. Avant de finaliser, confirme la parité "
                     "sémantique (traductions équivalentes dans les deux langues).\n")
    sys.exit(0)


if __name__ == "__main__":
    main()
