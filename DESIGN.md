# DESIGN.md - Système de design de nicolaspieper.com

Source de vérité visuelle du site. Complète [AGENTS.md](AGENTS.md) (règles
d'intervention) et le [template d'article](.claude/skills/add-article/TEMPLATE.md)
(processus blog). En cas de conflit, AGENTS.md prime.

## 1. Esprit

« Documentation premium » : le site ressemble à une belle doc technique,
pas à un portfolio marketing. Sobriété, retenue, précision. Une seule
teinte d'accent, des composants réutilisés partout, aucun effet sans
utilité. La personnalité passe par les détails (terminal, stickers,
micro-animations rares), jamais par le volume.

## 2. Couleurs

Tout passe par les tokens de `site.css`, jamais de couleur en dur.

| Token | Clair | Sombre | Rôle |
| --- | --- | --- | --- |
| `--bg` | #FAF9F5 ivoire | #262624 | fond |
| `--ink` | #171716 | #F0EEE7 | texte principal |
| `--muted` | #66655E | #9F9D93 | texte secondaire, metas |
| `--accent` | #FF4F00 | #FF4F00 | International Orange : marques, bordures actives, focus |
| `--accent-ink` | #C23C00 | #FF8551 | orange lisible AA pour le TEXTE accentué |
| `--code-bg` / `--code-ink` | #21201C / #EDEBE2 | idem | terminaux |

Règles : l'orange pur `--accent` n'est jamais utilisé pour du texte
courant (AA : `--accent-ink`). Un seul accent sur le site, pas de
palette secondaire. Les statuts (dashboard) sont toujours doublés d'un
libellé texte, jamais couleur seule.

## 3. Typographie

- **Source Serif 4** : titres (h1, h2 de sections, gros chiffres).
- **Inter** : corps de texte, UI.
- **JetBrains Mono** : eyebrows, metas, breadcrumbs, terminal, badges,
  tout ce qui donne la fibre technique. Jamais de font-variant-caps
  dessus (pas de petites capitales dans la fonte).
- Apostrophes typographiques (’) et guillemets courbes (“ ” en EN,
  « » en FR) dans toute la prose. **Aucun tiret cadratin ni
  demi-cadratin, nulle part** (hook bloquant, voir AGENTS.md).
- Titres d'articles avec point final ; titres de pages sans.

## 4. Mesures et mise en page

- Prose générale du site : max-width 60ch (`.content p`).
- **Articles de blog : deux largeurs, une seule grille.** Flux textuel
  (prose, titres, listes, principes, callout, terminal) plafonné à
  **38rem** ; figures visuelles (post-hero, post-diagram, video-facade)
  à **45rem**, alignées sur le même bord gauche. Jamais de dégradé
  accidentel de largeurs : un bloc est soit à la mesure du texte, soit
  au débord des figures. (Fixé en rem et non en ch : ch varie avec le
  corps de chaque bloc.)
- Cartes d'index du blog : meta empilée (date / temps de lecture /
  catégorie), pas de ligne à séparateurs qui se replie.

## 5. Composants

Inventaire complet et cas d'usage : voir le
[template d'article, § 4](.claude/skills/add-article/TEMPLATE.md).
L'essentiel :

- `checklist` = items d'UNE ligne ; `principles` (01, 02, ...) = listes
  longues ou séquentielles ; `callout` = une idée clé par article.
- **Terminal et diagramme SVG inline sont les deux composants
  signature de la fibre engineering** : à privilégier dans les articles
  techniques (une commande qui rejoue l'idée ; un schéma qui résume la
  thèse). Le diagramme se construit à la main aux tokens du site
  (`.post-diagram`, source mermaid en commentaire, `width`/`height`
  obligatoires sur le svg).
- Aucune lib externe, aucun CDN, jamais.

## 6. Mouvement

Philosophie héritée des passes d'audit (Emil Kowalski) :

- Fréquence d'abord : ce qui est vu souvent ne s'anime pas (pas
  d'effets au chargement des pages de contenu, pas d'animation des
  données qu'on lit).
- Le « budget delight » vit sur les surfaces rares : la 404 (entrée en
  fondu décalé, sticker qui s'ébroue), la bascule de thème.
- Micro-retours existants : nudge de flèche des text-links, inclinaison
  des stickers qui se redresse au survol, curseur du terminal du
  dashboard. Hover toujours gardé par `(hover: hover) and (pointer:
  fine)` ; `prefers-reduced-motion` fige tout via le bloc global.
- Transform et opacity uniquement ; courbe maison
  `cubic-bezier(0.23, 1, 0.32, 1)` ; moins de 300 ms pour l'UI.

## 7. Images : deux familles, jamais mélangées

Le site a exactement deux langages d'image. Le choix n'est pas une
question de goût mais de FONCTION :

### Swiss / géométrique (l'image PORTE une information)

Aplats vectoriels nets, grille, angles francs, zéro texture, zéro
contour dessiné. Palette stricte : encre, ivoire, International Orange.

Usages : logo et marques (carré NP), favicons, gabarit OG du site,
diagrammes inline des articles, sparklines du dashboard, icônes UI.
Dès qu'une image structure, mesure, navigue ou identifie : Swiss.

Bloc de prompt (à adapter) :

> Flat geometric vector graphic, Swiss design style, strict grid, sharp
> edges, solid fills only, no outlines, no texture, no gradients, two
> colors: deep charcoal #171716 on ivory #FAF9F5 with a single
> International Orange #FF4F00 element, generous negative space, no
> text.

### Sticker / illustré (l'image RACONTE)

Dessin encré à la main, tons ivoire et sable, grain papier léger, un
seul accent orange sur deux ou trois éléments, **bord die-cut blanc
épais, fond transparent**, ombre douce. Chaleureux, narratif, humain.

Usages : portrait de l'accueil, stickers des études de cas, héros
d'articles de blog, Pampy (404, Beyond engineering). Dès qu'une image
met en scène des personnages, une métaphore ou une émotion : sticker.

Bloc de prompt (le canon de la série) :

> Die-cut sticker style illustration, flat vector look, bold dark
> charcoal outlines (#171716), warm muted ivory and sand tones, exactly
> one accent color: International Orange (#FF4F00) on two or three
> small elements only, subtle paper grain texture, soft rounded shapes,
> thick white die-cut border around the whole composition, isolated on
> a transparent background, soft drop shadow, no text, no letters, no
> logos.

Ajouter le format : `wide horizontal composition 3:2` (héros
d'articles) ou `square composition` (mascottes, portraits).

### Règles communes aux deux familles

- Même palette (encre, ivoire, orange parcimonieux) : c'est elle qui
  fait tenir les deux langages ensemble.
- Jamais de texte dans une image générée (le vrai texte vit en HTML).
- Pipeline technique systématique (Pillow, local) : vérifier la vraie
  transparence (les générateurs posent souvent un faux fond, détourer
  par flood-fill depuis les bords, le bord die-cut sert de frontière) ;
  héros WebP 1200 px q82 ; variante OG 1200×630 aplatie sur ivoire en
  JPEG q85 (les scrapers sociaux gèrent mal la transparence) ; jamais
  de PNG brut de générateur dans le repo.
- Une image = un usage. Pas de sticker dans l'UI fonctionnelle, pas de
  pictogramme Swiss au milieu d'une scène illustrée.

## 8. Thèmes clair / sombre

Tout composant doit fonctionner dans les deux thèmes via les tokens,
sans surcharge dédiée si possible. Les stickers à bord die-cut blanc et
fond transparent passent tels quels sur les deux fonds ; c'est une des
raisons du standard. Vérification avant commit : clair + sombre,
desktop + mobile (AGENTS.md).
