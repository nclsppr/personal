# Kirow SNCF, grande version

Cette étude est indépendante de la miniature de `kirow/src`. Les pages sont
publiées en français sous `/kirow/grande-echelle/` et en anglais sous
`/kirow/en/large-scale/`. Les références prioritaires sont les quatre photos
fournies par Nicolas, documentées dans `REAL-CRANE-REFERENCES.md`.

Le châssis mesure 88 tenons, soit 704 mm. Le rapprochement avec les 14 m
communiqués par SNCF donne une échelle indicative proche de 1:20, sans plan coté.
Les deux wagons sont une interprétation visuelle des photographies du convoi.

## Source commune

- `src/blueprint.ts` définit les pièces, groupes, étapes et positions de la grue.
- `src/transport.ts` ajoute les deux wagons et les prolongements de voie.
- `catalog.ts` complète le catalogue de la miniature, sans le modifier.
- `data/parts-evidence.json` documente les références et couleurs supplémentaires.
- `src/scene.ts` applique les poses avec les mêmes matrices que l’export LDraw.
- `src/geometry.ts` mutualise les vraies géométries et leurs instances.
- `src/model-data.json` est généré. Il porte les comptes de la grue, du transport
  et de l’inventaire complet ; aucun de ces comptes n’est saisi dans le HTML.

Le mode transport rétracte la flèche et les bras, relève les patins et place le
contrepoids sur le wagon arrière. Dans la notice, ce dernier transfert attend
l’étape des semelles de chargement pour garder une représentation cohérente.
Les panneaux noirs de cabine sont opaques et les marquages sont personnalisés.
Le câble est un repère de simulation, sans référence de pièce ajoutée.

## Régénération depuis la racine du dépôt

Les dépendances de compilation restent celles de `kirow/package.json`.
Chrome local produit les images du même moteur que le site. Les PDF nécessitent
Python avec ReportLab et Pillow. Node 22 ou plus est nécessaire pour les cartes
sociales. Ces dépendances ne sont pas chargées par le site public.

```sh
node kirow/large-scale/build.mjs
node kirow/large-scale/scripts/check-assembly.mjs
node kirow/large-scale/render-assets.mjs
python3 kirow/large-scale/generate-documents.py
node kirow/large-scale/render-social-assets.mjs
python3 kirow/large-scale/generate-pages.py
python3 scripts/validate-site.py
```

`render-assets.mjs --preview-only` produit uniquement les vues de contrôle.
Le rendu complet enregistre les empreintes des sources et sorties dans
`assets/render-manifest.json`. La génération des PDF vérifie ces empreintes
et produit `assets/documents-manifest.json`.

## Portée des contrôles

`check-assembly.mjs` utilise les géométries et transformations réelles pour
contrôler les raccords visibles des roues, stabilisateurs, sections de flèche,
axes, poulies, vérins et berceau, ainsi que le dégagement du crochet en transport.
Il vérifie aussi l’absence de redimensionnement des pièces. Il ne certifie ni
toutes les connexions LEGO, ni la résistance, ni la capacité de levage ou la
stabilité d’un prototype physique. Les inventaires ne sont pas une liste d’achat
validée et ne déduisent aucun prix ni stock des preuves de catalogue.

La bibliothèque LDraw et ses auteurs sont crédités dans
`assets/LDraw-LICENSES.txt`. Les photos des tiers restent hors du dépôt.
