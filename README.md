# nicolaspieper.com — Journal de bord

Site personnel de Nicolas Pieper. Ce README sert de journal de bord : chaque intervention
sur le site y est consignée, la plus récente en premier.

**Production :** [nicolaspieper.com](https://nicolaspieper.com) (canonique) · nicolas.pieper.fr (redirection 301)
**Hébergement :** GitHub Pages · **Stack :** HTML/CSS/JS statique, zéro framework, zéro CDN externe.

---

## 2026-07-15 — Parité FR/EN, corrections UX (thème iOS, scrollspy, deep-link langue)

Signalements de Nicolas + mise en place d'une règle de parité entre les deux langues.

- **Fil d'Ariane FR corrigé** : `fr/index.html` affichait `nicolaspieper.com / fr` au lieu
  de `nicolaspieper.com / aperçu` (le libellé EN équivalent est « overview »). Un placeholder
  `fr` restait à la place du libellé traduit.
- **Deep-link au changement de langue** (`assets/js/site.js`) : les liens EN⇄FR (en-tête et
  pied de page) reçoivent désormais l'ancre de la section courante suivie par le scrollspy.
  Changer de langue conserve l'endroit où on était dans la page (les `id` de section sont
  identiques dans les deux langues). Fonctionne même après un défilement manuel.
- **Barre d'état iOS synchronisée au thème** : les deux `<meta name="theme-color">` en
  `media=(prefers-color-scheme)` ne suivaient que la préférence système, pas le bouton
  jour/nuit du site — la Dynamic Island gardait donc l'ancienne couleur au changement manuel.
  Remplacés par un seul `<meta name="theme-color">` piloté en JS (script anti-flash de `<head>`
  + toggle) : `#FAF9F5` en clair, `#262624` en sombre. Appliqué aux 5 pages (dont `404.html`).
- **Scrollspy — section Contact** : la dernière section, trop courte, n'entrait jamais dans
  la bande de détection de l'`IntersectionObserver` → son entrée de menu ne s'allumait jamais.
  Ajout d'une détection de bas de page (throttlée en `requestAnimationFrame`) qui épingle le
  dernier lien du menu quand la page est défilée jusqu'en bas.

**Règle de parité FR/EN (imposée par Nicolas) :** avant chaque commit touchant le site,
vérifier que `/` et `/fr/` restent équivalents (même structure, mêmes sections, et chaque
texte est la traduction équivalente — aucun texte source oublié, aucun placeholder). Un hook
`git commit` (`~/Developer/.claude/hooks/check-i18n-parity.py`) bloque désormais le commit si
la parité *structurelle* diverge (sections/ancres désynchronisées, fil d'Ariane FR = code
langue). La parité *sémantique* reste vérifiée par relecture.

_Vérifié dans le panneau navigateur : fil d'Ariane, bascule theme-color et deep-link langue OK.
Le scrollspy dépend de `innerHeight` (rapporté à 0 par le panneau) → à confirmer sur iPhone réel._

## 2026-07-15 — Responsivité iPhone (safe areas, notch, tap targets)

Passe dédiée au rendu sur iPhone (testé/pensé pour iPhone 15, 393×852). Le layout de base
était fluide mais ne respectait pas les règles de navigation iOS. Corrections dans
`assets/css/site.css`, `assets/css/cv.css`, `404.html` et le `<meta viewport>` des 5 pages :

- **Zones de sécurité (encoche / Dynamic Island / indicateur d'accueil)** : ajout de
  `viewport-fit=cover` + tokens `env(safe-area-inset-*)`. L'en-tête fixe réserve désormais
  la hauteur de la barre d'état (`--header-offset`), le contenu et le tiroir mobile
  dégagent l'indicateur d'accueil en bas, et le contenu respecte les encoches latérales
  en paysage.
- **Bug `100vh` iOS Safari** : sidebar et pages passées en `100dvh` (la barre d'outils
  Safari ne tronque plus le bas).
- **Cibles tactiles** : boutons d'icône 34 → 40 px, portés à 44 px (min. Apple HIG) sur
  `@media (pointer: coarse)` ; zones tap agrandies pour le sélecteur de langue et la nav.
- **Confort iOS** : `overflow-x: clip` (garde anti-défilement horizontal),
  `-webkit-tap-highlight-color: transparent` (pas de flash gris au tap),
  `overscroll-behavior: contain` sur le tiroir.

Sur un appareil sans encoche, tous les `env()` valent 0 → rendu identique à avant (aucune
régression desktop). Vérifié via simulation d'encoche + valeurs calculées ; le test
définitif se fera sur l'iPhone réel une fois le DNS en place.

**Décision i18n :** on conserve **deux fichiers HTML** distincts (`/` et `/fr/`) plutôt
qu'une traduction JavaScript runtime — choix dicté par la priorité SEO (aperçus de partage
et `hreflang` nécessitent des pages pré-rendues par URL). Les deux versions sont maintenues
à la main et gardées synchronisées.

## 2026-07-15 — Audit qualité multi-agents et corrections

Passe d'audit adversariale (12 agents : SEO technique, WCAG 2.2 AA, relecture française,
fidélité au contenu source, intégrité des liens). 29 findings bruts, 7 majeurs confirmés
après contre-vérification, 22 mineurs — tous corrigés :

- **Accessibilité** : contraste du CTA contact (3.12:1 → 6.21:1), ancres de titres
  désormais visibles au focus clavier, drawer mobile retiré de l'ordre de tabulation
  quand il est fermé (`visibility`) + retour du focus au bouton menu, anneau de focus
  conforme (≥3:1), contrastes du bloc terminal relevés, `::selection` conforme,
  attributs `lang` sur les liens en langue étrangère.
- **Contenu** : section « Current focus / Priorités actuelles » (priorité 88 % dans
  INFOS.md) ajoutée aux deux homepages ; « Site reliability engineering » (non sourcé)
  remplacé par « Production engineering » dans les JSON-LD ; « Engineering roles »
  → « Engineering internships » (fidélité aux sources).
- **Français** : « d'accounting » → « de traçabilité », grammaire (« ne doit pas *nous*
  éloigner »), harmonisation terminologique entre pages FR (appareils connectés,
  exigences métier, preuve de concept, titres de postes en anglais), apostrophes
  typographiques (140 remplacements), espaces insécables dans les métas.
- **SEO** : titres raccourcis ≤65 caractères avec « Luxembourg » dans les deux langues,
  meta descriptions ramenées à ~150 caractères, breadcrumbs FR pointant vers /fr/.

## 2026-07-14 — Refonte complète v2026

Refonte totale du site, réalisée avec Claude Code (Opus 4.8 + Fable 5). L'ancienne version
« pizza » (2024) est remplacée par un design inspiré des documentations Claude AI : sobre,
ivoire/encre, une seule couleur d'accent (terracotta `#D97757`), typographie serif pour les
titres (Source Serif 4), Inter pour le corps, JetBrains Mono pour les touches techniques.

### Concept

Le site se présente comme **la documentation de Nicolas Pieper** : sidebar de navigation
par groupes (Get started / Platforms / Leadership / Reference), scrollspy, ancres sur les
titres, breadcrumb, sélecteur de version (v2026 · v2022) qui pointe vers l'archive de
l'ancien site conservée dans [`/v2022/`](v2022/).

### Architecture

| URL | Contenu |
| --- | --- |
| `/` | Homepage anglaise (langue par défaut) |
| `/fr/` | Homepage française |
| `/cv/` | CV anglais (imprimable → PDF via `window.print()`) |
| `/fr/cv/` | CV français |
| `/v2022/` | Archive de la version 2022 (non indexée) |
| `/infos/` | Source de contenu ([INFOS.md](infos/INFOS.md), non indexée) |

### Décisions techniques

- **Bilinguisme par URLs distinctes** (`/` EN, `/fr/` FR) avec `hreflang` réciproques,
  au lieu de l'ancien toggle JavaScript invisible pour les moteurs de recherche.
- **Domaine canonique : nicolaspieper.com** (fichier `CNAME`). GitHub Pages n'accepte
  qu'un domaine custom par repo → `nicolas.pieper.fr` doit être configuré en
  redirection 301 chez le registrar (voir TODO).
- **Polices auto-hébergées** (woff2 variables, sous-ensembles latin + latin-ext,
  ~270 Ko au total) : performance (pas de requête tierce) et conformité RGPD
  (pas de transfert d'IP vers Google Fonts).
- **Thème clair/sombre** : bascule manuelle persistée en `localStorage`, défaut aligné
  sur `prefers-color-scheme`, script inline anti-flash dans le `<head>`.
- **Zéro dépendance** : pas de framework, pas de CDN, un seul fichier JS (~2 Ko)
  pour le thème, la sidebar mobile et le scrollspy.
- **Images générées localement** : favicon SVG (monogramme NP), PNG dérivés et image
  OpenGraph 1200×630 rendus via `qlmanage`/`sips` (outils macOS natifs).

### SEO

- Balises canoniques + `hreflang` (en, fr, x-default) sur les 4 pages.
- JSON-LD `@graph` : `Person` (id stable `#person`), `WebSite`, `ProfilePage`
  (+ `BreadcrumbList` sur les CV).
- OpenGraph + Twitter Cards avec image dédiée 1200×630.
- `sitemap.xml` avec alternates `xhtml:link` par langue ; `robots.txt` excluant
  `/v2022/` et `/infos/` (archives et sources non destinées à l'index).
- `404.html` personnalisée (GitHub Pages la sert automatiquement).
- Contraste AA : l'accent terracotta est décliné en `--accent-ink` plus foncé
  (`#9A4A26`) pour tout texte, le `#D97757` restant décoratif.
- Performance : polices préchargées, `font-display: swap`, aucun script bloquant.

### Contenu

- Source unique : [infos/INFOS.md](infos/INFOS.md) (rédigé par Nicolas, priorités par
  section respectées).
- CV disponible en **deux langues** (`/cv/` EN, `/fr/cv/` FR), mise en page écran
  « document » + feuille de style d'impression A4 pour export PDF.

### TODO (actions côté Nicolas)

- [ ] DNS : pointer `nicolaspieper.com` vers GitHub Pages (A/AAAA apex + CNAME www).
- [ ] DNS : rediriger en 301 `nicolas.pieper.fr` → `https://nicolaspieper.com`.
- [ ] Activer « Enforce HTTPS » dans les settings GitHub Pages après propagation.
- [ ] Déclarer le site dans Google Search Console + soumettre `sitemap.xml`.
- [ ] Mettre à jour l'URL du site sur le profil LinkedIn.
- [ ] (Optionnel) Fournir une photo récente pour remplacer le monogramme.
- [ ] Confirmer la section « Langues » des CV (Français natif / Anglais professionnel) —
      non présente dans INFOS.md ; ajouter allemand/luxembourgeois le cas échéant.

---

## 2026-07-14 — Ajout des archives

- Import de la version 2022 du site dans [`/v2022/`](v2022/) pour l'historique.
- Ajout de [infos/INFOS.md](infos/INFOS.md), source de contenu de la refonte.

## 2024 — Version « pizza »

Site one-page au thème pizzeria napolitaine (Anton / Permanent Marker / Space Mono,
marquee, stickers). Remplacée par la v2026 ; le code reste dans l'historique git
(`git log -- style.css script.js`).

## 2022 — Version Bootstrap

Carte de visite one-page (Bootstrap 5, avatar, liens). Archivée dans [`/v2022/`](v2022/).
