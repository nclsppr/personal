# AGENTS.md

Règles pour toute intervention automatisée (Claude Code, Codex, etc.) sur ce dépôt.
Voir [`README.md`](README.md) pour l'architecture et [`CHANGELOG.md`](CHANGELOG.md) pour l'historique.

## Vérité et contenu

- Ne jamais inventer de métrique, de responsabilité, de client, de produit ou de technologie.
- Ne pas modifier un chiffre ni un fait sans validation explicite de Nicolas.
- Ne pas transformer une contribution collective en réalisation individuelle.
- Ne publier aucune information interne ou confidentielle.
- Signaler toute ambiguïté (titre, période, périmètre) plutôt que de la trancher seul.
- **Tirets longs interdits, partout et sans exception.** Aucun tiret cadratin (U+2014),
  demi-cadratin (U+2013) ni barre horizontale (U+2015) dans le dépôt : ni prose, ni titres,
  ni dates, ni séparateurs, ni commentaires de code, ni documentation. Remplacements :
  tiret simple « - » (plages de dates, séparateurs de docs), point médian « · »
  (séparateurs du site : titres de pages, footer, organisations), ou reformulation
  (virgule, deux-points, parenthèses) pour les incises. Un hook `git commit`
  (`check-no-emdash.py`) bloque toute occurrence, archive `v2022/` exclue.

## Parité FR/EN

- Toujours mettre à jour les **deux langues dans le même commit**.
- `/` (EN) et `/fr/` (FR), ainsi que `/cv/` et `/fr/cv/`, gardent la même structure, les
  mêmes sections et ancres, et des textes équivalents (aucun texte source oublié, aucun
  placeholder).
- Un hook `git commit` vérifie la parité *structurelle* ; la parité *sémantique* se relit.
  (Les hooks vivent dans [`.claude/hooks/`](.claude/hooks/), enregistrés via `.claude/settings.json`.)

## Blog

- Tout nouvel article suit **strictement** le template maison :
  [`.claude/skills/add-article/TEMPLATE.md`](.claude/skills/add-article/TEMPLATE.md)
  (structure des pages EN + FR, SEO, sticker de la série, plomberie
  d'index et de sitemap, vérifications avant commit).
- La skill `/add-article` (même dossier) automatise le processus ; elle est
  versionnée, contrairement aux skills tierces (voir `.gitignore`).
- Le sticker d'en-tête est soit une TODO pour Nicolas (prompt fourni),
  soit généré via ChatGPT avec son accord explicite ; jamais d'image
  référencée avant d'exister.

## CV PDF

- Les PDF téléchargeables (`/assets/docs/nicolas-pieper-cv-en.pdf` et `…-fr.pdf`) sont le
  **rendu d'impression** des pages `/cv/` et `/fr/cv/` (Chrome headless applique
  `@media print` / `@page` de [`assets/css/cv.css`](assets/css/cv.css)).
- **Dès qu'on modifie `cv/index.html` ou `fr/cv/index.html`** (contenu, structure ou styles
  d'impression), **régénérer les deux PDF** et les inclure dans le *même commit* que les pages,
  pour que le fichier téléchargé reste fidèle à la page HTML.
- Commande unique : `./scripts/generate-cv-pdf.sh` puis `git add assets/docs/nicolas-pieper-cv-*.pdf`.
- Un hook `git commit` bloque le commit si une page CV est stagée sans son PDF régénéré.

## Miniature de partage (og-home.png)

- La miniature Open Graph / Twitter (`assets/img/og-home.png`, 1200×630) est le
  rendu du gabarit [`scripts/og-template.html`](scripts/og-template.html)
  (Chrome headless, capture d'écran). Elle reprend l'identité du site : logo,
  International Orange, polices auto-hébergées, portrait sticker, métriques.
- **Dès que l'identité visible change** (logo, accent, titre, rôle, tagline,
  métriques phares), mettre à jour le gabarit puis régénérer :
  `./scripts/generate-og-image.sh`, et committer l'image avec le changement.
- Les URLs `og:image` / `twitter:image` portent un paramètre de version
  (`?v=N`) : l'incrémenter à chaque régénération pour invalider le cache des
  scrapers sociaux (LinkedIn, X).

## Accessibilité (à préserver)

- Navigation complète au clavier, focus toujours visible, contrastes ≥ existant (AA).
- Cibles tactiles confortables (≥ 44 px sur pointeurs grossiers).
- ARIA mis à jour dynamiquement quand l'état change (thème `aria-pressed`, scrollspy
  `aria-current`, tiroir `aria-expanded` + `inert` sur le fond).
- Aucune information portée uniquement par la couleur ; images informatives avec `alt` ;
  éléments décoratifs masqués aux technologies d'assistance.

## Architecture et compatibilité

- Le site reste **statique** et compatible **GitHub Pages** : pas de dépendance runtime,
  pas de framework, pas de CDN, pas de traduction JavaScript côté client.
- Le contenu doit rester lisible **sans JavaScript**.
- Les URLs actuelles restent stables ; les ancres pertinentes sont préservées ou redirigées.
- Design : conserver l'International Orange `#FF4F00`, l'esprit « documentation premium »,
  les thèmes clair/sombre, les polices auto-hébergées. Pas de dégradé décoratif générique,
  pas de multiplication de cartes, pas d'animation sans utilité, `prefers-reduced-motion` respecté.
  **Le système de design complet (couleurs, typo, mesures, mouvement, familles d'images
  Swiss vs sticker et blocs de prompt) est dans [`DESIGN.md`](DESIGN.md).**

## Avant de committer

Tester la modification sur : **mobile + desktop**, **clair + sombre**, et l'**impression**
du CV le cas échéant. Si une page CV a changé, **régénérer les PDF** (voir § « CV PDF »)
et les committer avec la page. Mettre à jour le [`CHANGELOG.md`](CHANGELOG.md) pour toute
intervention notable.

## Publication obligatoire

- **Toute intervention terminée et validée sur le site doit être commitée puis poussée.**
  Ne jamais laisser un travail terminé uniquement en local.
- Sur `main`, pousser vers `origin main` afin de déclencher la publication GitHub Pages.
  Si Nicolas demande explicitement une autre branche, pousser cette branche à la place.
