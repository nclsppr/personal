# Kirow sur rails · Édition cadeau

Page française `/kirow/`, traduction anglaise `/kirow/en/`.
Le set fictif **990150** contient les **400 briques standard** du modèle numérique,
réparties en **32 étapes**. La présentation jaune et noire est spécifique à ce cadeau.
Les deux pages sont en `noindex, nofollow`, hors navigation et sitemap.
Elles restent publiques : le lien n'est pas un contrôle d'accès.

## Architecture

HTML natif pré-rendu, CSS et TypeScript compilé en modules JavaScript locaux.
Three.js 0.180.0 et three-gpu-pathtracer 0.0.24 sont inclus dans les fichiers servis.
Aucun CDN, aucune API distante ni collecte. Le thème de la page est mémorisé dans
la session du navigateur (`sessionStorage`, clé `kirow-page-theme`).

L'interface charge environ 4 Ko de JavaScript initial non compressé. La scène et
le moteur sont chargés à la demande ; le path tracer est un module séparé.
Sur écran tactile, l'utilisateur active la 3D explicitement. Le même canvas passe
du coffret à la zone de commandes. La vue de secours reste visible sans WebGL.
Le ray tracing utilise 5 rebonds et s'arrête après convergence (128 échantillons
sur petit écran, 256 sur ordinateur). Les mouvements restent désactivés par défaut.

```sh
cd kirow
npm ci
npm run build
```

Depuis la racine, `npm run dev` démarre un aperçu statique sans dépendance.
GitHub Pages sert les fichiers commités tels quels et ne lance aucune compilation.
Les sources sont dans `src/`, les ressources livrées dans `assets/`.
`generate-pages.py` produit les deux HTML et les deux inventaires CSV.
Après toute modification du blueprint, régénérer aussi les 32 illustrations,
le PDF et le LDraw pour conserver la même maquette dans tous les livrables.

## Limite physique du fascicule

Les briques ont des dimensions et références de catalogue LEGO. Le PDF français
et le lecteur bilingue décrivent l'étude numérique. Roues, rails, vitrages,
articulations, poulies, crochet et vérin sont des volumes de référence non compris
dans les 400 pièces. Les liaisons, la stabilité et le montage avec des pièces
commercialisées doivent encore être conçus et testés sur prototype.
Ne pas présenter cet ensemble comme un kit officiel ou un montage fonctionnel validé.

## Sources et droits

- Grue SNCF, Dijon-Perrigny, 150 t, 23 m, rotation 360° :
  https://www.sncf-reseau.com/fr/cp/bourgogne-franche-comte/grue-kirow-unique-en-france-en-action-dijon
- Logo SNCF : SVG original du site officiel de recrutement,
  https://emploi.sncf.com/medias/af41b1da-20a7-4969-9054-da301135b595.svg?t=1710312016052
- Logo KIROW : sept tracés vectoriels d'origine extraits de la brochure officielle
  KIROW de 2018, sans redessin,
  https://www.techne-kirow.de/fileadmin/template-2021/downloads/Slag_Taurus/Slag_Taurus_E_280618.pdf
- Dimensions LDraw : https://www.ldraw.org/article/218.html
- Catalogue de référence : https://www.bricklink.com/v2/catalog/catalogitem.page?P=3001
- Path tracer : https://github.com/gkjohnson/three-gpu-pathtracer

Les logos restent les marques de leurs propriétaires. Leur présence illustre le
cadeau demandé et ne suggère aucune affiliation. Le badge « Brick Atelier » est
original. La numérotation est imaginaire. Les images sont des rendus du modèle,
pas des photographies d'un set existant. Les textes de licence des moteurs figurent
dans `assets/THIRD-PARTY-LICENSES.txt`.

## Vérification

`python3 scripts/validate-site.py` depuis la racine contrôle notamment les routes,
les langues, les fichiers locaux, l'inventaire et les 32 illustrations.
L'interface, les logos, le lecteur de montage et les thèmes ont été inspectés dans
le navigateur de test, ainsi qu'aux largeurs 375 et 430 px. La 3D se replie
correctement vers l'image si WebGL est désactivé. Le rendu GPU et les gestes Safari
sur iPhone restent à vérifier sur le Mac/appareil de Nicolas.
