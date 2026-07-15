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
du CV le cas échéant. Mettre à jour le [`CHANGELOG.md`](CHANGELOG.md) pour toute intervention
notable.
