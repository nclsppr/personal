# Provenance des visuels Projets

Les logos et cartes ci-dessous sont des copies locales ou des dérivés fidèles des assets
canoniques des projets.
Les couleurs propres aux projets restent confinées aux cadres éditoriaux de la page Projets.
Les sources des vues de course figurent dans le [dossier Turbo Miette](turbo-miette/PROVENANCE.md).
Le portrait, les deux plans et leur voix sont documentés dans le [dossier Gutenberg](guteneo-workshop/PROVENANCE.md).

| Fichier local | Source canonique | SHA-256 | État |
| --- | --- | --- | --- |
| `guteneo-logo.webp` | https://guteneo.com/brand/gutenberg-guteneo-stamp-transparent.webp | `c84a227827fa6d7586d4f632ca0ab41475f94faeeec1ac0e9b0eaba989cd2c04` | Timbre de communication de Guteneo, dérivé transparent 192 x 192 |
| `guteneo-social-card.png` | https://guteneo.com/social/guteneo-share-neutral-20261003-v2.png | `5fb4d32786416896f10bce9a6a035465f9edf9705de7cdd4406afd21b74552d4` | Copie identique de la carte de partage du site officiel, 1200 x 630 |
| `surplasse-app-icon.svg` | https://surplasse.com/brand/surplasse-app-icon.svg | `2f9b5fc9f05c24ad9bfd51704cd55bd5e9d7142ec60e419e631e87ea68eedef7` | Icône officielle de l’application, 1024 x 1024. Seul le texte de la balise title a été adapté. |
| `surplasse-logo.webp` | https://surplasse.com/brand/surplasse-logo-horizontal.svg | `7974f4bfa032d4a10e79d8c00c3dafd0cced91bbf9e458de9be9f4d6d29b52fa` | Dérivé transparent 906 x 198, WebP sans perte |
| `surplasse-social-card.png` | https://nclsppr.github.io/surplasse/brand/surplasse-social-card.png | `bbd48883feb31d7c0b03bee55766c3c8f746e0f00bdc0073cd16520cef1cc3ab` | Copie byte-identique de la preview upstream fusionnée, URL apex non activée |
| `papers-empire-logo.webp` | https://papersempire.com/assets/brand/papers-empire-logo-v2-cutout.webp | `414e2dcbbe2ab181ef63c88d3fd4427c1e507b0feec168c29e8e02c0d2aebc10` | Copie byte-identique |
| `papers-empire-social-card.jpg` | https://papersempire.com/assets/images/social-card.jpg | `82fe9457455a2bd62d5d4b2abc001651086ed21d9c6f49da16aea7aac2edadad` | Copie byte-identique |
| `parkventory-logo.svg` | https://parkventory.com/parkventory-logo-transparent.svg | `f145d51082b3e934a23a80096494809ab1a3b6c96f6ba64ebca1ef0597089316` | Copie byte-identique |
| `parkventory-social-card.png` | https://parkventory.com/parkventory-social-card.png | `fd2ccf37d786492a13379920712b9c6400858216abe0110139edd5cd8db061bf` | Copie byte-identique, déploiement public vérifié en PNG 1200 x 630 |
| `parkventory-social-card-en.png` | https://parkventory.com/parkventory-social-card-en.png | `19e8bb34a4b8b5035b9bd8037e7e16740cae74580c8bed2b755c2c778fed486b` | Copie identique de la carte anglaise |
| `fouranu-logo.png` | https://fouranu.com/brand/logo-fouranu.png | `ef9a6a452622c18f66ac5f9db4619e17648253d9a68ffed5441c632ba11f0c66` | Copie byte-identique |
| `fouranu-social-card.jpg` | https://fouranu.com/og/four-a-nu-default-v2.jpg | `cf593fd469c3d490a50ac9824921bbf73fb26e39cd321456ab6b17ff7786f2ba` | Copie byte-identique |
| `monflorian-avatar-v2.webp` | https://monflorian.com/assets/florian-v2-original-web.webp | `5d8e314db20eb8feac45dc059fede71c6ae808f96c1b6cb73c4c2fb39a877da9` | Copie byte-identique, portrait V2 actif 384 x 384 |
| `monflorian-wordmark.webp` | https://monflorian.com/assets/monflorian-wordmark-web.webp | `941c00869e36c83fd261c4d6195d219479e8685cb203c594d84f0b9e91cef966` | Copie byte-identique, mot-symbole actif 338 x 181 |
| `monflorian-tokyo.webp` | https://monflorian.com/v2/media/japan-tokyo-couple-720.webp | `f99b3f3cf0079c04fdf122aa92c1ab2db387ff2caf587a5d248091a15902dc8c` | Variante officielle 720 x 480 de l’illustration du carnet Japon, identique à la source |
| `monflorian-social-card.png` | https://monflorian.com/assets/monflorian-social-card.png | `530f2127e049c37c88370ed81d67ff7e027076346b41a7f6815317d374e48061` | Ancienne carte publique, conservée à son URL historique. Réutilisation autorisée par Nicolas |
| `projects-social-card.jpg` | `scripts/projects-og-template.html` | `5cc6c55f6cd08009bb465d62fe121bcb0e3dcdd845b0c0619639c2de2917ccd3` | Carte du hub générée localement, 1200 x 630 |
| `projects-social-card-fr.jpg` | `scripts/projects-og-template.html` | `4ed207ebebf0eb7a9e7e5df0ec20d1be85855e9318a5be1343f3b5ac7c74e6f3` | Carte FR du hub générée localement, 1200 x 630 |

Les visuels Guteneo reprennent le timbre de la marque, fourni par Nicolas pour
les communications publiques du produit. Le 21 novembre 2026, la carte a été
copiée depuis l’URL Open Graph de Guteneo. Le timbre reprend la version
transparente du site, dont le master a pour SHA-256
`9f6af31bb4d308258bb224696d2ea23734efef570228c56824d4322be4832b8e`.
Le petit format conserve son contour dentelé et sa couleur d’origine.

```sh
cwebp -quiet -q 88 -resize 192 192 gutenberg-guteneo-stamp-transparent.webp -o guteneo-logo.webp
```

Le carnet Japon de Mon Florian utilise des personnages fictifs et des
illustrations créées pour le projet. La couverture de Tokyo est l’image de
partage actuelle du site. La copie locale utilise sa variante publique de
720 px. Les deux cartes Parkventory correspondent aux images Open Graph
officielles de ses accueils anglais et français, vérifiées le 21 novembre 2026.

Le lockup Mon Florian est composé en HTML et CSS à partir du portrait V2 et du
mot-symbole actifs. Aucun dérivé combiné n'est conservé, afin que le portrait
puisse évoluer sans recréer un logo figé.

Le master du logo Surplasse est un SVG de 906 x 198, SHA-256
`b6f99cc8232d15edfa2a6401267188395a098da05bfe6cdd00638934539fec4e`.
Sa copie texte n’est pas conservée dans ce dépôt, car son titre canonique contient un
caractère interdit par la règle typographique locale. Le dérivé est produit en affichant
le SVG dans Chrome sur un canevas transparent de 906 x 198, puis avec :

```sh
chrome --headless=new --window-size=906,198 --hide-scrollbars \
  --force-device-scale-factor=1 --default-background-color=00000000 \
  --screenshot=surplasse-logo.png file:///path/to/surplasse-logo-horizontal.svg
cwebp -quiet -lossless -m 6 surplasse-logo.png -o surplasse-logo.webp
```

Les empreintes des actifs déjà publiés ont été vérifiées contre leurs URLs publiques le
2026-08-27. La carte Surplasse finale est issue de la révision upstream fusionnée
`1a86a1c1653701ec5084fd7b423b839567c9853b`. Sa source éditable publique est
`https://nclsppr.github.io/surplasse/brand/surplasse-social-card.svg`, SHA-256
`dcb4f5dd581f225a875c98469c2494db8146163a5fabcefb6a43b7604533a64f`.
La cible `https://surplasse.com/brand/surplasse-social-card.png` répondait encore 404, car
l’apex n’était pas activé. La carte Parkventory finale vient de la révision upstream fusionnée
`938c3a40aef5e65affaf19d6a1c546cbfa5a78f1`. Son URL publique a été vérifiée avec le type
`image/png`, les dimensions 1200 x 630 et la même empreinte.
