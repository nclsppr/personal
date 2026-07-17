# Template d'article de blog - nicolaspieper.com

Source de vérité pour tout nouvel article. À respecter absolument, par les
humains comme par les agents. Les règles générales du dépôt (vérité du
contenu, tirets longs interdits, parité FR/EN) restent définies dans
[AGENTS.md](../../../AGENTS.md) et priment en cas de doute.

## 1. Fichiers et URLs

- Deux pages par article, même slug anglais des deux côtés :
  - `blog/<slug>/index.html` (EN)
  - `fr/blog/<slug>/index.html` (FR)
- Slug court, descriptif, en kebab-case anglais (ex. `ai-in-the-sdlc`).
- Les deux langues sont créées, reliées et commitées **dans le même commit**.
- Partir d'un article existant comme squelette exact
  (`blog/claude-in-the-enterprise/` est la référence ; `blog/ai-in-the-sdlc/`
  pour les motifs vidéo et diagramme).

## 2. Head (SEO complet, obligatoire)

- `<title>` : `<Titre de l'article> · Nicolas Pieper` (sans point final).
- `meta description` : 140 à 160 caractères, résume l'angle, pas de superlatifs.
- `canonical` + `hreflang` ×3 (en, fr, x-default vers la version EN).
- Open Graph : `og:type article`, `og:title`, `og:description`, `og:url`,
  `og:image` (voir § Sticker), `og:locale` + alternate,
  `article:published_time`, `article:author`.
- Twitter Card `summary_large_image` (mêmes valeurs).
- JSON-LD : `BlogPosting` (`@id` = URL + `#post`, `author`/`publisher` =
  `@id` person du site, `isPartOf` = blog de la langue, `keywords` 5 à 7)
  et `BreadcrumbList` (Aperçu / Blog / Article).
- Icônes, `theme-color`, preloads des trois polices, script anti-flash du
  thème : copier du squelette, ne pas réinventer.

## 3. Corps de page

- `body class="page-work"`, skip-link, header complet du site (lien Blog
  présent, PAS d'aria-current sur un article), lang-switch vers
  l'équivalent exact de l'article, backdrop, layout.
- Sidebar : groupe « On this page / Sur cette page » (ancres des sections)
  + groupe « More articles / Autres articles » (Tous les articles + les
  autres articles).
- Breadcrumb : `nicolaspieper.com / blog / <slug>` (FR : segment `fr` en plus).
- `<article>` :
  - `header.page-intro` : eyebrow `Blog · <Catégorie>`, `h1` (avec point
    final), `p.post-meta` (date longue localisée · `x min read` /
    `x min de lecture` · Nicolas Pieper, ~200 mots/min), `p.lead`.
  - `figure.post-hero` : le sticker (voir § Sticker). Si le sticker n'est
    pas encore prêt, OMETTRE la figure (ne jamais référencer une image
    inexistante).
  - Sections `doc-section` avec `anchor-heading` + ancre `#`, **ids
    identiques en EN et FR** (le texte des titres est traduit, pas les ids).
  - `page-next` : `← All articles` + `next-primary` vers l'article suivant
    logique.
- Footer standard du site + `site.js`.

## 4. Composants (réutiliser, ne pas inventer)

| Besoin | Composant |
| --- | --- |
| Liste courte d'items d'UNE ligne | `ul.checklist` |
| Liste longue, étapes, phases | `div.principles` (numéros 01, 02, ...) |
| Encadré d'idée clé | `div.callout` |
| Extrait shell / CLI | `div.terminal` (motif du site) |
| Vidéo externe | Façade `.video-facade` : miniature auto-hébergée, zéro requête tierce avant le clic, iframe youtube-nocookie au clic, lien YouTube sans JS (modèle : ai-in-the-sdlc) |
| Diagramme | SVG inline aux tokens du site dans `figure.post-diagram`, source mermaid en commentaire |

La fibre « engineering » du site passe par deux composants à privilégier
dès qu'ils sont pertinents : le **terminal** (rejouer une idée en session
shell, une commande et sa sortie valent souvent un paragraphe) et le
**diagramme SVG inline** (résumer la thèse de l'article en une image aux
tokens du site, source mermaid en commentaire). Un article technique
gagne presque toujours à avoir l'un des deux ; ne pas les forcer sur un
article qui n'en a pas besoin.

Aucune lib externe, aucun CDN, pas de CSS ad hoc : si un besoin ne rentre
dans aucun composant, l'ajouter proprement à `site.css` (section Blog).
Les règles visuelles détaillées (couleurs, mesures, familles d'images et
blocs de prompt) vivent dans [DESIGN.md](../../../DESIGN.md).

Règle de mesure (gérée par site.css, rien à faire dans l'article) : le
flux textuel (prose, titres, listes, principes, callout, terminal) est
plafonné à 38rem ; les figures visuelles (post-hero, post-diagram,
video-facade) s'étendent à 45rem, même bord gauche. Deux largeurs
franches, jamais un dégradé de largeurs au fil de la page.

## 5. Contenu

- Première personne, voix de Nicolas : sobre, concret, phrases courtes,
  honnête sur les limites. Écrit pour être utile, pas pour avoir raison.
- AUCUNE métrique, client, responsabilité ou fait inventé (AGENTS.md).
- Jamais de tiret cadratin ni demi-cadratin. Apostrophes typographiques en FR.
- Une citation maximum, < 15 mots, attribuée. Le reste : reformuler.
- 700 à 900 mots par langue ; 4 à 7 sections.
- Lier vers les pages du site (work, autres articles) quand c'est naturel.
- FR = traduction fidèle et complète de EN (aucun paragraphe oublié).

## 6. Sticker d'en-tête (illustration)

Chaque article reçoit un sticker de la série (die-cut, encre #171716, tons
ivoire/sable, un seul accent #FF4F00, bord blanc épais, fond transparent,
sans texte, composition large 3:2).

- **Par défaut : créer une TODO pour Nico** avec un prompt précis prêt à
  coller (bloc de style commun + scène spécifique à l'article).
- **Alternative** : le générer soi-même via ChatGPT avec l'extension Claude
  in Chrome, UNIQUEMENT si l'extension est connectée et avec l'accord
  explicite de Nicolas (ça consomme son quota).
- À réception de l'image, pipeline local (Pillow) :
  1. Détourer si le générateur a mis un faux fond (flood-fill depuis les
     bords, le bord die-cut blanc sert de frontière).
  2. `assets/img/blog/<slug>-hero.webp` : 1200 px de large, qualité 82.
  3. `assets/img/blog/<slug>-og.jpg` : 1200×630, sticker centré aplati sur
     ivoire #FAF9F5, JPEG qualité 85 (les scrapers sociaux gèrent mal la
     transparence).
  4. Ajouter la `figure.post-hero` (alt descriptifs distincts EN et FR,
     `width`/`height` réels, `loading="eager"`) et basculer `og:image`,
     `twitter:image` et l'`image` du JSON-LD sur la variante `-og.jpg`.
- Tant que le sticker n'existe pas : pas de figure, `og-home.png` en OG.

## 7. Plomberie d'intégration (rien n'est optionnel)

1. **Cartes d'index** : nouvelle carte en TÊTE de `blog/index.html` et
   `fr/blog/index.html` (post-meta avec date, temps de lecture,
   `span.post-cat` catégorie ; h3 ; description 1-2 phrases ; text-link).
2. **Sidebars des index** : ancre de l'article dans le groupe Articles.
3. **JSON-LD des index** : `@id` du post ajouté en tête du tableau `blogPost`.
4. **« More articles » des autres articles** : lien ajouté (EN + FR).
5. **Chaîne de lecture** : le `next-primary` de l'ancien dernier article
   pointe vers le nouveau.
6. **sitemap.xml** : deux entrées (EN + FR) avec hreflang ×3,
   `lastmod` du jour, `changefreq yearly`, `priority 0.6`.
7. **CHANGELOG.md** : une entrée datée décrivant l'article.

## 8. Vérifications avant commit

- [ ] `grep -rlP '[\x{2013}\x{2014}\x{2015}]'` sur les fichiers touchés : rien.
- [ ] Jamais de `-->` à l'intérieur d'un commentaire HTML (source mermaid :
      noter les flèches `->` ; `-->` FERME le commentaire et déverse le
      reste en texte dans la page).
- [ ] SVG inline : `width` + `height` en plus du `viewBox` (sans eux,
      `height: auto` peut rendre 0×0).
- [ ] Prévisualisation : desktop + mobile, clair + sombre (serveur
      `personal-site` du launch.json).
- [ ] Liens internes cliqués (lang-switch, cartes, page-next, sidebar).
- [ ] Les hooks de commit passeront : parité FR/EN, tirets, PDF CV non
      concernés.
- [ ] Commit (message impératif français) + push, sans redemander.

## 9. Après publication

- Le sitemap est déclaré auprès de Google/Bing : rien à faire de plus.
- Si l'identité visible du site change (jamais pour un simple article),
  seulement alors régénérer og-home (voir AGENTS.md).
