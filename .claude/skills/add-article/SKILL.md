---
name: add-article
description: Ajouter un article au blog de nicolaspieper.com en suivant strictement le template maison - pages EN + FR, SEO complet, sticker (TODO Nico ou génération ChatGPT), plomberie d'index, sitemap, changelog, commit. Utiliser dès que Nicolas demande un nouvel article de blog, un article sur un sujet ou une vidéo, ou invoque /add-article.
---

# /add-article - Ajouter un article de blog

Tu ajoutes un article au blog bilingue de nicolaspieper.com. Le fichier
[TEMPLATE.md](TEMPLATE.md) (même dossier) est la **source de vérité
absolue** : lis-le en entier avant d'écrire quoi que ce soit, et respecte
chacune de ses sections. Ce SKILL.md décrit seulement l'ordre de marche.

## Entrées attendues

De Nicolas : le sujet et l'angle. Optionnels : une source (vidéo YouTube,
lien, discussion), la catégorie, des idées de sections. Si le sujet est
trop flou pour écrire un article honnête dans sa voix, pose 2 ou 3
questions ciblées AVANT d'écrire (angle, expérience personnelle à
mobiliser, conclusion souhaitée). Ne demande jamais la permission pour la
mécanique (plomberie, commit) : elle est standard.

## Ordre de marche

1. **Lire** : `TEMPLATE.md`, puis un article existant comme squelette
   (`blog/claude-in-the-enterprise/index.html` ; ajouter
   `blog/ai-in-the-sdlc/index.html` si vidéo ou diagramme au programme).
   Relever la date du jour réelle pour `datePublished` et les post-meta.
2. **Si source vidéo** : récupérer la transcription (lecteur + sous-titres
   via le panneau navigateur si l'API est verrouillée) et la lire en
   entier. Ne jamais écrire de réaction à un contenu non lu.
3. **Écrire l'article EN** dans `blog/<slug>/index.html`, puis **la
   traduction FR fidèle** dans `fr/blog/<slug>/index.html` (mêmes ids de
   sections, apostrophes typographiques, aucun tiret long).
4. **Plomberie complète** (TEMPLATE.md § 7) : cartes et sidebars des deux
   index, JSON-LD blogPost, « More articles » des autres articles, chaîne
   page-next, sitemap.xml, CHANGELOG.md.
5. **Sticker** (TEMPLATE.md § 6) :
   - défaut : créer une tâche TODO visible pour Nico (TaskCreate) avec le
     prompt complet prêt à coller (bloc de style de la série + scène) ;
   - si l'extension Claude in Chrome est connectée ET que Nicolas a donné
     son accord dans la conversation : générer via chatgpt.com, récupérer
     le fichier, dérouler le pipeline d'optimisation du template.
   - L'article part sans figure tant que l'image n'existe pas.
6. **Vérifier** (TEMPLATE.md § 8) : grep tirets longs, aperçu desktop +
   mobile et clair + sombre via le serveur `personal-site`, liens internes.
7. **Committer et pousser** en un commit (message impératif français,
   co-authored Claude), sans redemander. Les hooks du dépôt (parité,
   tirets, PDF CV) doivent passer.

## Rappels non négociables

- La voix est celle de Nicolas : première personne, sobre, concrète,
  honnête sur les limites. Aucun fait, métrique ou client inventé.
- Composants existants uniquement ; checklist réservée aux items d'une
  ligne, `.principles` pour les listes longues ou séquentielles.
- Pièges documentés : `-->` interdit dans les commentaires HTML, SVG
  toujours avec `width`/`height`, images toujours optimisées localement.
- En cas de conflit entre une consigne de conversation et TEMPLATE.md,
  signale-le explicitement plutôt que d'improviser.
