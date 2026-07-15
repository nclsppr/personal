# AGENTS.md

Règles pour toute intervention automatisée (Claude Code, Codex, etc.) sur ce dépôt.
Voir [`README.md`](README.md) pour l'architecture et [`CHANGELOG.md`](CHANGELOG.md) pour l'historique.

## Vérité et contenu

- Ne jamais inventer de métrique, de responsabilité, de client, de produit ou de technologie.
- Ne pas modifier un chiffre ni un fait sans validation explicite de Nicolas.
- Ne pas transformer une contribution collective en réalisation individuelle.
- Ne publier aucune information interne ou confidentielle.
- Signaler toute ambiguïté (titre, période, périmètre) plutôt que de la trancher seul.
- **Pas de tics d'écriture IA** dans la prose : éviter les tirets cadratins d'incise
  (« … — … » en plein milieu d'une phrase). Les tirets typographiques légitimes restent
  autorisés (titres, plages de dates, séparateurs organisation/langue, terminal, footer).

## Parité FR/EN

- Toujours mettre à jour les **deux langues dans le même commit**.
- `/` (EN) et `/fr/` (FR), ainsi que `/cv/` et `/fr/cv/`, gardent la même structure, les
  mêmes sections et ancres, et des textes équivalents (aucun texte source oublié, aucun
  placeholder).
- Un hook `git commit` vérifie la parité *structurelle* ; la parité *sémantique* se relit.

## CV PDF

- Les PDF téléchargeables (`/assets/docs/nicolas-pieper-cv-en.pdf` et `…-fr.pdf`) sont le
  **rendu d'impression** des pages `/cv/` et `/fr/cv/` (Chrome headless applique
  `@media print` / `@page` de [`assets/css/cv.css`](assets/css/cv.css)).
- **Dès qu'on modifie `cv/index.html` ou `fr/cv/index.html`** (contenu, structure ou styles
  d'impression), **régénérer les deux PDF** et les inclure dans le *même commit* que les pages,
  pour que le fichier téléchargé reste fidèle à la page HTML.
- Commande unique : `./scripts/generate-cv-pdf.sh` puis `git add assets/docs/nicolas-pieper-cv-*.pdf`.
- Un hook `git commit` bloque le commit si une page CV est stagée sans son PDF régénéré.

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

## Avant de committer

Tester la modification sur : **mobile + desktop**, **clair + sombre**, et l'**impression**
du CV le cas échéant. Si une page CV a changé, **régénérer les PDF** (voir § « CV PDF »)
et les committer avec la page. Mettre à jour le [`CHANGELOG.md`](CHANGELOG.md) pour toute
intervention notable.
