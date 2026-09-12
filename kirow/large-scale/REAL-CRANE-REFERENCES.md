# Références de la grue réelle

Relevé documentaire du 12 septembre 2026 pour la seconde interprétation en briques de la grue Kirow SNCF de Dijon. Le modèle de 452 pièces conserve son identité et son inventaire propres.

Le fichier [data/real-crane-evidence.json](data/real-crane-evidence.json) contient les mêmes distinctions sous une forme exploitable par le générateur : `facts`, `observations`, `assumptions` et `sources`.

## Photographies fournies par Nicolas le 12 septembre 2026

Ces quatre pièces jointes deviennent les références visuelles prioritaires pour la silhouette et la configuration de transport. Elles complètent les données explicitement publiées par SNCF Réseau ; elles ne fournissent pas de plan coté ni de courbe de charge.

Aucune photographie n’est copiée dans les assets du site. L’auteur, la date de prise de vue et les droits de reproduction ne sont pas établis par leur présence dans la conversation. Leur emploi comme référence de modélisation ne vaut pas autorisation de les publier. Les empreintes ci-dessous permettent de retrouver les originaux sans enregistrer un chemin temporaire propre à la session.

| Repère | Vue fournie | Observations utilisées pour la maquette |
| --- | --- | --- |
| U1 | Profil en transport, flèche vers la gauche | Superstructure longue et basse, flèche repliée proche du dessus du capot, équipements latéraux distincts. |
| U2 | Grue en intervention, vue latérale avec personnel au premier plan | Cabine et capot de hauteur voisine, longue flèche fine, pied de flèche triangulaire, vérin incliné sous le bras et crochet suspendu. |
| U3 | Gros plan du bogie et du vérin, côté opposé à la cabine | Quatre essieux visibles sur ce bogie, longeron sombre, boîtes d’essieux, articulation du vérin et différence entre pied de flèche et corps télescopique. |
| U4 | Convoi complet en transport, vue de trois quarts | Grue encadrée par des wagons, wagon sous la flèche à gauche et plateforme chargée à droite. Cette vue guide les deux wagons ajoutés au modèle. |

Empreintes SHA-256 des pièces jointes originales :

- U1 : `bdd6088122303725088fad97a4f225fb1b2a60a6b8ca2df1c0621be341c86e52`
- U2 : `23854a67d8cbdbbe6e8ca812e508306952d47430986acb9143ebb6458862f557`
- U3 : `666a050df1300053bc682b7548da5ace0b8a40093229d9d00708139b68008c98`
- U4 : `b3a4abc0f38aeac03d0d3779e8a56c7ba880ef5e205dfa01ffbe3ee23d1960b6`

Les proportions sont relues sur plusieurs vues : capot bas et allongé, toit de cabine proche du niveau du capot, flèche plus fine avec un pied distinct, huit essieux répartis en deux bogies. Les deux wagons du convoi restent une interprétation de la vue U4, avec des références de pièces propres au modèle. Aucune référence de wagon réel, capacité de transport, période ou numéro de machine n’est déduite des seuls pixels.

Le compte affiché pour la grue seule doit rester distinct du complément de transport. L’inventaire complet et les étapes comprennent les pièces réellement présentes dans les deux modes, y compris leur voie de présentation. Les photographies ne servent pas à transformer l’objectif d’environ 4 520 pièces en un nombre de pièces artificiellement imposé.

## Faits explicitement communiqués par SNCF Réseau

Le [communiqué du 8 avril 2026 sur Bully-les-Mines](https://www.sncf-reseau.com/medias-publics/2026-04/cp_bully_les_mines-vdiff_0.pdf?VersionId=qjcw0Mvq.2V4.dojOLVVHdMMeSVGyfDG), page 3, décrit la grue acheminée depuis Dijon :

| Donnée | Valeur publiée | Limite d'interprétation |
| --- | --- | --- |
| Longueur | 14 m | Les extrémités de mesure et la configuration de la flèche ne sont pas précisées. Ce n'est pas un plan coté. |
| Masse | 108 t | La composition de cette masse n'est pas détaillée. |
| Capacité de levage maximale | 150 t | Aucune courbe de charge n'est fournie. Cette valeur ne s'applique pas à toutes les portées. |
| Rotation | 360° | Le communiqué ne détaille pas les axes de rotation ni leurs limites par configuration. |

Le [communiqué SNCF Réseau du 1 octobre 2025](https://www.sncf-reseau.com/fr/cp/bourgogne-franche-comte/grue-kirow-unique-en-france-en-action-dijon) documente également une démonstration à Dijon. Son titre ne suffit pas à identifier la variante constructeur.

## Identification à conserver prudente

La désignation **KRC 1210** est probable pour cet exemplaire SNCF, souvent présenté sous le nom de famille **KRC 1200**. Elle n'est pas enregistrée comme un fait constructeur vérifié dans ce relevé.

- La [notice Kleinspoor 830 B, datée 4-2017](https://www.kleinspoor.nl/830%20B%20frans%204-2017.pdf) porte KRC 1200 dans son titre, puis KRC 1210 dans le texte de sa page 4. C'est une documentation de maquette, pas la fiche du constructeur de la grue réelle.
- Le [reportage photographique partagé sur STTX le 10 juillet 2007](https://www.forum.sttx.fr/viewtopic.php?f=79&t=8864) attribue KRC 1210 à la machine photographiée par Oliver Beretta. Une plaque constructeur lisible n'a pas été vérifiée.
- La [brochure Kirow Multi Tasker](https://www.kirow.de/fileadmin/template-2021/downloads/Multi_Tasker/MultiTasker_FR_020718.pdf), page 14, décrit la famille 1200. Ses options ne sont pas automatiquement celles de l'exemplaire SNCF.

Le nom public prudent reste « Kirow SNCF de Dijon ». Ne pas convertir 1200, 1210 ou 1500 en désignation certaine sans preuve supplémentaire.

## Dix observations pour la modélisation

La page 14 de la notice Kleinspoor contient six photographies de la vraie grue SNCF, créditées Bernard Ciry. Elles sont distinctes des photographies de la maquette présentées dans les autres pages. La vue Oliver Beretta montre l'ensemble en transport. Le rendu `kirow/assets/preview.jpg` du modèle compact a été ouvert pour la comparaison.

| Élément | Observation et direction de conception | Référence |
| --- | --- | --- |
| Silhouette | Rechercher une superstructure basse, longue et dense. Réduire l'impression de cabine et de coffre isolés au milieu d'une plateforme vide. | Photos Ciry, p. 14 ; vue Beretta |
| Châssis | Différencier les longerons sombres, équipements sous caisse, traverses de tête et tampons. | Photos Ciry, p. 14 |
| Roulement | Rendre lisibles huit essieux, répartis entre deux trucks de quatre, avec boîtes d'essieux et suspensions. | Photos Ciry, p. 14 ; brochure Kirow, p. 14 |
| Cabine | Construire une cabine latérale asymétrique, allongée, avec vitrage sombre et face avant inclinée. | Photos Ciry, p. 14 |
| Flèche | Montrer trois corps télescopiques emboîtés, leurs changements de section, les colliers et les guidages. | Notice Kleinspoor, p. 1 et 3 ; vue Beretta |
| Relevage | Représenter les deux vérins latéraux, leurs tiges et leurs ancrages sous la flèche. | Photos Ciry, p. 14 ; notice Kleinspoor, p. 1 et 3 |
| Tête et crochet | Composer une tête compacte à chevrons avec poulies et mouflage distincts ; vérifier la taille du crochet contre la silhouette entière. | Vue Beretta ; notice Kleinspoor, p. 13 |
| Contrepoids | Distinguer le capot moteur, le bras arrière télescopique et les éléments emboîtés du contrepoids SNCF. | Photos Ciry, p. 14 ; notice Kleinspoor, p. 3 et 13 |
| Stabilisateurs | Donner une forme mécanique aux quatre appuis orientables : bras, vérin vertical, pied et plaque de répartition distincts. | Photos Ciry, p. 14 ; notice Kleinspoor, p. 1 et 2 |
| Équipements | Utiliser portes, grilles, treuil, tuyaux, échappement et volants pour enrichir la fidélité de chaque face. | Photos Ciry, p. 14 |

Ces observations orientent une interprétation en briques. Elles ne constituent ni une nomenclature industrielle complète ni une certification des mécanismes du modèle.

## Proportions : objectifs et incertitudes

La cible de **88 tenons de longueur de châssis** est un choix de conception. Avec un pas de 8 mm, elle représente 704 mm. Rapprocher cette longueur des 14 m communiqués donne `14000 / 704 = 19,89`, soit un ordre de grandeur **1:20**.

Ce calcul ne calibre pas exactement le modèle sur une photographie. Les extrémités de la longueur SNCF ne sont pas définies ; celles du châssis numérique doivent également être explicitées avant toute comparaison cotée. Ne pas publier « réplique exacte au 1:20 » sur la base de ce seul calcul.

Les largeurs, hauteurs, entraxes, diamètres et courses des mécanismes ne disposent pas ici de cotes SNCF vérifiées. Leur éventuelle valeur dans le modèle est une estimation de proportion ou une contrainte de construction en briques. Aucune valeur numérique réelle ne leur est attribuée dans ce relevé. Le générateur doit préserver cette distinction.

L'objectif d'environ dix fois le nombre de pièces du modèle compact donne environ 4 520 pièces. C'est un objectif de conception, pas le compte d'un inventaire déjà produit. Le nombre effectivement affiché devra être calculé depuis la nomenclature de la grande version.

## Usage des sources et photographies

Les sources ont été consultées comme références documentaires et visuelles internes. Aucun PDF ni photographie source n'est copié dans ce dossier. Les photographies de Bernard Ciry, celles d'Oliver Beretta et les visuels Kirow conservent leurs droits respectifs. Une mise à disposition publique ou un crédit ne vaut pas autorisation de réutilisation sur le site.

Les graphismes et photographies de plusieurs dates peuvent montrer des livrées différentes. Choisir une configuration documentée pour la grande version et éviter de combiner silencieusement des détails appartenant à d'autres opérateurs ou variantes.
