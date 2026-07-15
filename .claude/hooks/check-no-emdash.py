#!/usr/bin/env python3
"""PreToolUse(Bash) hook - bloque `git commit` si un fichier texte stagé contient
un tiret long : cadratin (U+2014), demi-cadratin (U+2013) ou barre horizontale
(U+2015). Regle AGENTS.md : jamais de tirets longs, on utilise « - », « · » ou
une reformulation. L'archive v2022/ est exclue, ainsi que les binaires.

Ne s'active que dans le depot du site bilingue (index.html + fr/index.html),
comme les autres hooks. Les caracteres interdits sont construits via chr() pour
que ce fichier lui-meme n'en contienne aucun."""
import sys, json, os, re, subprocess

BANNED = {chr(0x2014): "tiret cadratin (U+2014)",
          chr(0x2013): "demi-cadratin (U+2013)",
          chr(0x2015): "barre horizontale (U+2015)"}
TEXT_EXTS = {".html", ".md", ".css", ".js", ".py", ".sh", ".xml", ".txt", ".json", ".svg"}
EXCLUDED_PREFIXES = ("v2022/",)


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
        sys.exit(0)

    try:
        staged = subprocess.run(
            ["git", "-C", repo, "diff", "--cached", "--name-only", "--diff-filter=d"],
            capture_output=True, text=True, timeout=5).stdout.split()
    except Exception:
        sys.exit(0)

    errors = []
    for path in staged:
        if path.startswith(EXCLUDED_PREFIXES):
            continue
        if os.path.splitext(path)[1].lower() not in TEXT_EXTS:
            continue
        try:
            blob = subprocess.run(["git", "-C", repo, "show", ":" + path],
                                  capture_output=True, timeout=5).stdout.decode("utf-8", "ignore")
        except Exception:
            continue
        for lineno, line in enumerate(blob.splitlines(), 1):
            for ch, label in BANNED.items():
                if ch in line:
                    errors.append("{}:{} contient un {} : {}".format(
                        path, lineno, label, line.strip()[:80]))

    if errors:
        sys.stderr.write("⛔ Tirets longs interdits (AGENTS.md) - commit bloqué :\n")
        for e in errors[:15]:
            sys.stderr.write("  • " + e + "\n")
        if len(errors) > 15:
            sys.stderr.write("  … et {} autre(s).\n".format(len(errors) - 15))
        sys.stderr.write("\nRemplace par « - », « · » ou reformule (virgule, deux-points).\n")
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
