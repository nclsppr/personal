# nicolaspieper.com

Site personnel de Nicolas Pieper — présenté comme sa **documentation** : sobre,
ivoire/encre, un seul accent (International Orange `#FF4F00`), bilingue FR/EN,
CV imprimable. Statique, sans framework ni dépendance runtime.

**Production :** [nicolaspieper.com](https://nicolaspieper.com) (canonique) ·
`nicolas.pieper.fr` (redirection 301)
**Hébergement :** GitHub Pages · **Stack :** HTML / CSS / JS statique, zéro framework, zéro CDN.

> L'historique détaillé des interventions est dans [`CHANGELOG.md`](CHANGELOG.md).
> Les règles pour les interventions automatisées sont dans [`AGENTS.md`](AGENTS.md).

## Aperçu

- **Bilingue par URLs distinctes** (`/` EN, `/fr/` FR) avec `hreflang` réciproques — pages
  pré-rendues pour le SEO, pas de traduction JavaScript côté client.
- **Thème clair/sombre** : bascule manuelle persistée en `localStorage`, défaut aligné sur
  `prefers-color-scheme`, script inline anti-flash dans le `<head>`.
- **Navigation « documentation »** : sidebar par groupes, scrollspy, ancres sur les titres,
  breadcrumb.
- **Accessibilité** : navigation clavier, focus visible, contrastes AA, cibles tactiles
  ≥44 px, tiroir mobile modal, ARIA mis à jour dynamiquement (thème, scrollspy).
- **Zéro dépendance runtime** : un seul fichier JS pour le thème, le tiroir mobile, le
  scrollspy, les redirections d’ancres et le deep-link de langue. Polices woff2 auto-hébergées.

## Architecture

| URL | Fichier | Contenu |
| --- | --- | --- |
| `/` | `index.html` | Homepage anglaise (langue par défaut) |
| `/fr/` | `fr/index.html` | Homepage française |
| `/work/` | `work/index.html` | Études de cas et leadership en anglais |
| `/fr/work/` | `fr/work/index.html` | Études de cas et leadership en français |
| `/cv/` | `cv/index.html` | CV anglais (imprimable → PDF via `window.print()`) |
| `/fr/cv/` | `fr/cv/index.html` | CV français |
| `/v2022/` | `v2022/` | Archive de la version 2022 (non indexée) |
| `/infos/` | `infos/INFOS.md` | Source de contenu (non indexée) |

```
assets/
  css/   site.css · cv.css
  js/    site.js            (thème · sidebar · scrollspy · deep-link langue)
  fonts/ woff2 variables (Inter · Source Serif 4 · JetBrains Mono, subsets latin/-ext)
  img/   logo, favicons, portraits, image OpenGraph
```

## Lancement local

Aucun build : ce sont des fichiers statiques. Un serveur local suffit (chemins absolus
`/assets/...`, donc servir depuis la racine du repo) :

```sh
python3 -m http.server 4173 --directory .
# → http://localhost:4173
```

La config `.claude/launch.json` (`personal-site`) fait la même chose pour l'aperçu intégré.

## Build

Aucune étape de build. Ce qui est dans le repo est déployé tel quel.

Assets images/favicons régénérés à la main via les outils macOS natifs (`sips`, `qlmanage`) ;
voir le `CHANGELOG.md` pour les commandes utilisées.

## Validation

Avant chaque commit touchant le site, la **parité FR/EN** doit être vérifiée : `/` et `/fr/`
gardent la même structure, les mêmes sections/ancres, et chaque texte est la traduction
équivalente (aucun texte source oublié, aucun placeholder).

Un hook `git commit` (`~/Developer/.claude/hooks/check-i18n-parity.py`) bloque le commit si
la parité *structurelle* diverge. La parité *sémantique* reste vérifiée par relecture.

Tester systématiquement : **mobile + desktop**, **clair + sombre**, et l'**impression** du CV.

## Déploiement

Push sur `main` → GitHub Pages sert le repo tel quel. Le domaine custom est fixé par `CNAME`.

## Principes de conception

- **Statique et sobre** : pas de framework, pas de CDN, pas de tracker. Le contenu reste
  lisible sans JavaScript.
- **Un seul accent** : International Orange `#FF4F00` réservé aux petites zones à fort impact ;
  le texte utilise une déclinaison plus sombre pour rester lisible (AA).
- **Esthétique « documentation »** : ivoire/encre, serif pour les titres, monospace pour les
  touches techniques. Pas d'animation gratuite ; `prefers-reduced-motion` respecté.
- **Vérité du contenu** : aucune métrique, responsabilité ou technologie inventée ; toute
  ambiguïté est signalée plutôt que tranchée arbitrairement.
