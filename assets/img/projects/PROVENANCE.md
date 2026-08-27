# Provenance des visuels Projets

Les logos et cartes ci-dessous sont des copies locales ou des dérivés fidèles des assets
canoniques des projets.
Les couleurs propres aux projets restent confinées aux cadres éditoriaux de la page Projets.

| Fichier local | Source canonique | SHA-256 | État |
| --- | --- | --- | --- |
| `surplasse-logo.webp` | https://surplasse.com/brand/surplasse-logo-horizontal.svg | `7974f4bfa032d4a10e79d8c00c3dafd0cced91bbf9e458de9be9f4d6d29b52fa` | Dérivé transparent 906 x 198, WebP sans perte |
| `surplasse-social-card.png` | https://nclsppr.github.io/surplasse/brand/surplasse-social-card.png | `bbd48883feb31d7c0b03bee55766c3c8f746e0f00bdc0073cd16520cef1cc3ab` | Copie byte-identique de la preview upstream fusionnée, URL apex non activée |
| `papers-empire-logo.webp` | https://papersempire.com/assets/brand/papers-empire-logo-v2-cutout.webp | `414e2dcbbe2ab181ef63c88d3fd4427c1e507b0feec168c29e8e02c0d2aebc10` | Copie byte-identique |
| `papers-empire-social-card.jpg` | https://papersempire.com/assets/images/social-card.jpg | `82fe9457455a2bd62d5d4b2abc001651086ed21d9c6f49da16aea7aac2edadad` | Copie byte-identique |
| `parkventory-logo.svg` | https://parkventory.com/parkventory-logo-transparent.svg | `f145d51082b3e934a23a80096494809ab1a3b6c96f6ba64ebca1ef0597089316` | Copie byte-identique |
| `parkventory-social-card.png` | https://parkventory.com/parkventory-social-card.png | `fd2ccf37d786492a13379920712b9c6400858216abe0110139edd5cd8db061bf` | Copie byte-identique, déploiement public vérifié en PNG 1200 x 630 |
| `fouranu-logo.png` | https://fouranu.com/brand/logo-fouranu.png | `ef9a6a452622c18f66ac5f9db4619e17648253d9a68ffed5441c632ba11f0c66` | Copie byte-identique |
| `fouranu-social-card.jpg` | https://fouranu.com/og/four-a-nu-default-v2.jpg | `cf593fd469c3d490a50ac9824921bbf73fb26e39cd321456ab6b17ff7786f2ba` | Copie byte-identique |
| `monflorian-avatar-v2.webp` | https://monflorian.com/assets/florian-v2-original-web.webp | `5d8e314db20eb8feac45dc059fede71c6ae808f96c1b6cb73c4c2fb39a877da9` | Copie byte-identique, portrait V2 actif 384 x 384 |
| `monflorian-wordmark.webp` | https://monflorian.com/assets/monflorian-wordmark-web.webp | `941c00869e36c83fd261c4d6195d219479e8685cb203c594d84f0b9e91cef966` | Copie byte-identique, mot-symbole actif 338 x 181 |
| `monflorian-social-card.png` | https://monflorian.com/assets/monflorian-social-card.png | `530f2127e049c37c88370ed81d67ff7e027076346b41a7f6815317d374e48061` | Copie byte-identique, réutilisation autorisée par Nicolas |
| `projects-social-card.jpg` | `scripts/projects-og-template.html` | `05e370e6082584f2e53f41d441ef9c03ddf2f241093a4eb42fc2ebcf9db6a9b7` | Carte du hub générée localement, 1200 x 630 |

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
