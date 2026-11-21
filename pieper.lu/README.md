# pieper.lu · À livre ouvert

Une édition personnelle de Nicolas Pieper. Le nom de domaine porte le concept :
`.lu` pour le Luxembourg, et « lu » pour une page que l'on parcourt comme une petite
publication. Le dernier chapitre conclut : « Vous avez lu Pieper. »

## Direction artistique

- Bleu royal `#1535D1`, papier ivoire `#F7F4E9`.
- Cormorant Garamond pour la grande typographie et les italiques, Manrope pour la lecture.
- Deux illustrations originales générées, entre gravure, architecture de papier et tramage,
  et un portrait caché de Nicolas et Pampy, adapté depuis leur photographie.
- Aucun emoji ni flèche Unicode susceptible d'être affichée comme un pictogramme coloré.
- Composition d'édition, grands changements d'échelle, filets fins, chapitre bleu,
  léger mouvement d'entrée et marque-page de lecture. Animation réduite respectée.
- Les références Hermès, Nous Research et Stripe inspirent respectivement le soin de
  l'illustration, la texture expérimentale et la netteté des interactions. Aucun élément
  graphique de ces marques n'est repris.

## Contenu et fonctionnement

Site statique autonome dans `dist/`, sans dépendance de compilation ni service externe.
Ouvrir `dist/index.html` ou servir `dist/` avec un serveur HTTP statique.
Les images, polices, styles et scripts sont locaux. Tous les chemins sont relatifs,
pour fonctionner aussi bien à la racine du futur domaine que sous un sous-dossier.
Le contenu et les liens restent utilisables sans JavaScript.

Le contenu professionnel et les états des projets reprennent le site personnel existant
au 5 septembre 2026. Les liens sortants ouvrent leur destination dans le même onglet.
Le contact utilise l'adresse existante `nicolas@pieper.fr`.

## La page cachée

Dans le passage consacré à Pampy, son nom ouvre un portrait de Nicolas et de son chien,
en gravure tramée bleu royal et ivoire. Le lien reste discret, avec un soulignement pointillé.
La fenêtre native se ferme avec « Refermer », Échap ou un clic sur le fond, puis redonne
le focus au lien. Elle fonctionne au clavier et au toucher. Sans JavaScript ou sans
support de `dialog.showModal()`, le même lien ouvre directement l'image.
La photo source n'est pas incluse dans le dépôt ; seule son adaptation est intégrée.

## Mise en ligne sur le futur domaine

Publier le contenu de `dist/` à la racine de `pieper.lu` sur l'hébergeur choisi.
Le domaine n'est ni acheté ni configuré par ce projet. Cette proposition est volontairement
`noindex` tant que le domaine et le contenu ne sont pas validés. Lors du lancement :

1. Retirer `meta name="robots"` dans `dist/index.html` et autoriser l'indexation dans `dist/robots.txt`.
2. Ajouter la canonique `https://pieper.lu/` et `og:url` une fois ce domaine actif.
3. Renseigner les DNS et vérifier HTTPS chez l'hébergeur.

L'aperçu privé Sites est décrit dans `.openai/hosting.json`. Il ne modifie pas le site
NicolasPieper.com. Aucune image de partage dédiée n'est incluse dans cette proposition.

## Vérification

Contrôler les chemins d'assets, les ancres, l'unicité des identifiants et la syntaxe
JavaScript. Le CSS contient des compositions explicites pour mobile, desktop et impression,
ainsi qu'un mode de réduction des animations. Aucun test visuel navigateur automatisé
n'est affirmé sans avoir été exécuté.
