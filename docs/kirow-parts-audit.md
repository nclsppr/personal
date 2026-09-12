# Kirow : audit des références de pièces

Vérification documentaire du 12 septembre 2026. Les références et les couleurs ont été recherchées dans les fiches ToyPro et dans le catalogue BrickLink, en privilégiant les couleurs attestées dans des sets. Les géométries sont traitées séparément par les données officielles LDraw.

La source exploitable par le site est [`kirow/src/parts-evidence.json`](../kirow/src/parts-evidence.json). Chaque couple pièce/couleur possède un nom français et anglais, une référence de catalogue, un numéro de dessin LEGO lorsqu’il est établi, les éventuels identifiants d’élément vus dans la source, les statuts de vérification et les URL consultées avec leur date. Les prix et stocks ne sont pas repris.

## Résultat

Le modèle comporte 335 briques standards et 109 éléments spécialisés, soit 444 éléments comptés, 42 références de catalogue et 51 couples pièce/couleur. Le vérin assemblé et la ficelle sont chacun comptés une fois. Le contrôle de correspondance entre `ALL_PARTS`, l’inventaire et les preuves ne trouve aucune référence manquante ou inutilisée.

Les formes de pièces sur mesure ont été remplacées par des références réelles. Les seules exceptions graphiques sont les marquages SNCF, KIROW et 150 t, explicitement personnalisés, ainsi que le ciel, l’herbe et le ballast de la scène. Ces éléments de décor ne sont pas des pièces du modèle.

## Choix et corrections

- Voie : cinq segments LEGO 53401 gris bleuté foncé, chacun de 16 tenons de longueur modulaire et 8 de largeur. Les 39 plaques qui simulaient les traverses ont été retirées car chaque segment possède ses traverses moulées.
- Roulement : huit supports LEGO 2878, seize roues LEGO 57878 noires et huit essieux RC métalliques réf. BrickLink x1687. Le diamètre de roulement des roues est de 16,6 mm, avec flasque de 23 mm. L’essieu x1687 mesure 5 tenons et possède l’alias de catalogue 57051 ; son équivalent géométrique LDraw est 57877, documenté dans l’ensemble 57877c01. Aucun numéro de dessin LEGO n’est déduit de ces alias.
- Pivots de bogie : base LEGO 3680 noire et dessus LEGO 3679 gris bleuté clair. Le dessus noir a été écarté : la présence d’une offre isolée ne suffit pas à attester cette couleur dans un set.
- Tamponnement : LEGO 4022, 2920 et 73092 noirs. Les composants sont comptés séparément, sans ajouter l’assemblage 4022c02 une seconde fois.
- Rotation : base LEGO 18939 gris bleuté clair et dessus LEGO 18938 noir, à 60 dents biseautées. Le dessus actuel à dents droites 88738 n’est pas confondu avec cette variante.
- Cabine : dix cadres jaunes LEGO 60592, dix vitres incolores LEGO 60601, siège LEGO 4079 et commandes LEGO 4592 / 4593 noirs. Les fenêtres remplacent les grandes vitres sans référence.
- Aérations et garde-corps : huit grilles noires réf. 2412b, numéro de dessin 2412, et deux garde-corps jaunes LEGO 2486. Les grilles se posent sur le toit pour utiliser une liaison verticale à tenons.
- Levage : un vérin réf. BrickLink 61927c01, quatre poulies LEGO 4185 noires, un crochet métallique noir LEGO 70644 et une ficelle fine noire de 50 cm réf. BrickLink x77ac50. Le vérin est gris bleuté clair avec embouts gris bleuté foncé. Les deux brins du rendu représentent une seule ficelle.
- Articulations et petits détails : LEGO 3701, 3707, 3713, 2780, 2429, 2430 et 4073. Le gyrophare utilise la couleur transparente orange attestée ; les feux utilisent le blanc.
- Brique ronde : la référence actuelle du catalogue est 3062, avec l’ancien alias 3062b. La fiche ToyPro jaune documente l’élément 306224 et le tenon ouvert.

## Portée de la validation

L’existence d’une pièce ne valide pas son emploi dans ce montage. Les ancrages du vérin, de la couronne, des stabilisateurs et des poulies, la rigidité de la flèche, son télescopage, le cheminement et la fixation de la ficelle, les collisions et la stabilité restent à vérifier dans un logiciel de construction puis sur un prototype physique. Le rendu et les exports sont une étude de montage, pas une notice certifiée ni une liste d’achat validée.

Les quantités correspondent aux éléments représentés. Les composants supplémentaires qu’un prototype exigerait pour résoudre ces interfaces ne sont pas inventés ou ajoutés artificiellement à cet inventaire.

## Contrôles de livraison

- Validation statique du site, syntaxe JavaScript/Python/shell et parité des routes : réussies.
- 32 illustrations d'étapes, deux aperçus, PDF français de 36 pages et export LDraw
  régénérés depuis les mêmes données. Les empreintes des sources et des sorties
  sont contrôlées avant publication.
- PDF relu après rendu : 32 étapes, 42 références présentes et tableaux lisibles.
  Les références de fichiers LDraw existent dans la bibliothèque officielle ; la
  ficelle souple est signalée par un commentaire plutôt que par un faux fichier de pièce.
- Parcours français et anglais inspectés aux largeurs 1440 et 390 px, en clair et
  en sombre : commandes, références par étape, ouverture de l'inventaire, recherche
  d'un identifiant et absence de résultat. Tableau contenu dans son défilement local.
- Safari sur Mac : couleur jaune observée dans la barre réelle du navigateur.
  Le format mobile a été inspecté dans le navigateur ; la barre et les gestes sur
  un iPhone physique n'ont pas été contrôlés sur appareil.
- Les 32 étapes et l'inventaire sont présents dans le HTML, indépendamment du
  chargement du module interactif. Le moteur et les données de géométrie sont locaux.

## English

This documentary audit verifies 42 catalogue references and 51 part/color combinations for the 444 items represented in the digital study. Every inventory entry has a dated source in `parts-evidence.json`. LEGO design numbers, catalogue variants, complete assemblies and cord-length references are explicitly distinguished. Stock and price are not asserted.

Custom SNCF, KIROW and 150 t markings and the environmental scenery are disclosed separately. Reference verification does not certify the construction: mechanical anchors, pulley supports, boom rigidity and telescoping, cord routing, collisions and stability still require a construction-software review and a physical prototype.
