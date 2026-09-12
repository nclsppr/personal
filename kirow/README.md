# Kirow sur rails · Étude de construction

Page française `/kirow/`, traduction anglaise `/kirow/en/`.
La maquette numérique se consulte en 3D et en **32 étapes**. Son inventaire est
calculé depuis les instances du modèle, avec les rails, les roues, le vitrage et
les mécanismes. Les quantités, références LEGO, couleurs et sources sont communes
à la page, au lecteur d'étapes et aux inventaires téléchargeables.

Les deux pages sont en `noindex, nofollow`, hors navigation et sitemap.
Elles restent publiques : le lien n'est pas un contrôle d'accès.

## Architecture

HTML natif pré-rendu, CSS et TypeScript compilé en modules JavaScript locaux.
Three.js est inclus dans les fichiers servis. Aucun CDN, aucune API distante ni
collecte. Le thème de la page est mémorisé dans la session du navigateur
(`sessionStorage`, clé `kirow-page-theme`).

La scène et son moteur sont chargés à la demande. Sur écran tactile, l'utilisateur
active la 3D explicitement. Le même canvas passe de la présentation à la zone de
commandes. La vue de secours reste visible sans WebGL. Les mouvements restent
désactivés par défaut. Le rendu extérieur utilise un ciel et un terrain herbeux ;
ces éléments de décor ne sont pas comptés comme des pièces LEGO.

Le bandeau de navigation reste jaune opaque, y compris dans le thème sombre.
Il reste au bord supérieur de la fenêtre pour prolonger cette couleur dans les
barres de Safari qui prennent en charge ce comportement. La balise `theme-color`
reprend le même jaune. L'effet final dépend de la version et des réglages du navigateur.

```sh
cd kirow
npm ci
npm run build
npm run render-assets
python3 generate-documents.py
```

Depuis la racine, `npm run dev` démarre un aperçu statique sans dépendance.
GitHub Pages sert les fichiers commités tels quels et ne lance aucune compilation.
Les sources sont dans `src/`, les ressources livrées dans `assets/`.
`generate-pages.py` produit les deux HTML et les deux inventaires CSV à partir de
`src/blueprint-data.json`, exporté lors de la compilation. Après toute modification
du blueprint, régénérer aussi les 32 illustrations, le PDF et le LDraw pour conserver
la même maquette dans tous les livrables.

Le rendu utilise Chrome installé localement. La variable `KIROW_CHROME` permet de
préciser son emplacement. La génération des documents requiert les dépendances
de `requirements-documents.txt` (`python3 -m pip install -r requirements-documents.txt`).
Les fichiers `model-manifest.json` et `render-manifest.json` relient les documents
et illustrations au modèle et permettent de repérer des ressources périmées.

## Références et limites du modèle

Le catalogue associe chaque variante utilisée à une référence de pièce LEGO, une
couleur et des sources datées. Les identifiants d'élément ne sont affichés que
lorsqu'ils sont documentés. Certains catalogues ajoutent un suffixe pour distinguer
une variante de moule ; ce code est présenté séparément de l'identifiant de dessin
LEGO. Une fiche de catalogue ne constitue pas une garantie de stock.

Le lecteur affiche les références et quantités de chaque étape. Les 32 étapes et
l'inventaire restent consultables sans JavaScript. La recherche par numéro, nom ou
couleur complète cette lecture lorsque JavaScript est actif. Les CSV contiennent
les identifiants, quantités, statuts, liens de preuve et date de vérification.

Le modèle reste une étude numérique : une pièce réelle référencée ne prouve pas
que les liaisons proposées s'emboîtent ou supportent la charge. La géométrie de
certaines représentations est simplifiée. Les interfaces, le passage des axes,
les débattements, la stabilité et le levage doivent être contrôlés dans un logiciel
de construction puis sur un prototype. Ne pas présenter cet ensemble comme un
kit officiel ou une grue fonctionnelle validée.

## Sources et droits

- Les références des pièces et leurs sources figurent dans le catalogue de preuves,
  dans l'inventaire HTML et dans les deux CSV.
- Grue SNCF, Dijon-Perrigny, 150 t, 23 m, rotation 360° :
  https://www.sncf-reseau.com/fr/cp/bourgogne-franche-comte/grue-kirow-unique-en-france-en-action-dijon
- Logo SNCF : SVG original du site officiel de recrutement,
  https://emploi.sncf.com/medias/af41b1da-20a7-4969-9054-da301135b595.svg?t=1710312016052
- Logo KIROW : sept tracés vectoriels d'origine extraits de la brochure officielle
  KIROW de 2018, sans redessin,
  https://www.techne-kirow.de/fileadmin/template-2021/downloads/Slag_Taurus/Slag_Taurus_E_280618.pdf
- Dimensions LDraw : https://www.ldraw.org/article/218.html
- Teinte Safari : https://bugs.webkit.org/show_bug.cgi?id=301756#c2
- Balise `theme-color` dans Safari :
  https://webkit.org/blog/11989/new-webkit-features-in-safari-15/

Les logos restent les marques de leurs propriétaires. Leur présence illustre la
grue et ne suggère aucune affiliation. Le badge « Brick Atelier » est original.
Les images sont des rendus du modèle, pas des photographies d'un set existant.
Les licences des ressources tierces sont conservées dans les ressources livrées.

## Vérification

`python3 scripts/validate-site.py` depuis la racine contrôle notamment les routes,
les langues, les fichiers locaux, l'inventaire et les 32 illustrations.
Vérifier après modification la présentation mobile et ordinateur, les deux thèmes,
le lecteur, les sources, la recherche, le clavier et la lecture sans JavaScript.
La validation de l'assemblage physique reste distincte de ces contrôles numériques.
