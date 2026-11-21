# Turbo Miette

L’emblème est un dérivé du titre officiel fourni par Nicolas et utilisé dans les menus du jeu. Les trois vues de course proviennent de captures de l’application dans le simulateur iPad. Les commandes, les positions des voitures et les décors font partie du jeu. Les noms des fichiers de test ne figurent pas dans les images publiées.

| Fichier publié | Original dans le projet ou ses captures | SHA-256 de l’original |
| --- | --- | --- |
| `emblem.webp` | `Resources/Art/Title/turbo-miette-title-approved.png` | `ceba1ee6d267d84872d39496a344dfa8dc281aa9bc574c4332d1c6a888b6a199` |
| `kitchen-cockpit.webp` | Lot `2026-10-05-art-pass/ui-ipad-final-attachments`, capture `68AFB052-040B-4C37-BEF1-A0515841DF77.png` | `9fde84483c52c80b8be54981f3abdba34815302e73fa1b1d0a052ca98bfa30ff` |
| `bedroom-start.webp` | `docs/qa/touch-latency/ui/ipad/11-Chambre-depart-sur-le-lit.png` | `d7b97d732e0906c45ec571fe47b47f2cbc1530ce942e899f2bc2c82a3f7c8ed7` |
| `garage-start.webp` | Lot `2026-10-05-art-pass/ui-ipad-final-attachments`, capture `1AAF7CFC-3984-4DC4-A220-BF00EA03A97C.png` | `00b71432a9c332087025d9f0424bc897cb0a3adf1c4a8d7bb1c3c50745a61f24` |
| `title-screen.webp` | `docs/qa/render-upgrade/iphone/01-Accueil.png` | `151d4077c96bfff22d50c381096c2f6ea9de0463992537f808d1bc6cf3037db0` |
| `driver-selection.webp` | `docs/qa/malia/05-Huit-pilotes-disponibles.png` | `a81813858267f147cd9d12bfbeeedec54aff0acac89f510495b6a7d311ab520b` |

Après application de l’orientation de capture, un recadrage 3:2 ancré sur le bas retire la barre système. Les vues sont réduites à 1440 × 960 avec un filtre Lanczos, puis encodées en WebP de qualité 88. Le titre est réduit à 480 × 360 avec son canal alpha.

Ces captures utilisent les décors et les voitures du projet. Les lots ci-dessus précèdent l’intégration des textures externes de la passe suivante.

Les écrans d’accueil et de sélection proviennent de deux parcours XCUITest sur simulateur iPhone. Les PNG de 2622 × 1206 conservent la composition paysage complète, réduite à 1600 × 736 en WebP de qualité 90. L’accueil affiche le titre officiel avec la voiture cyan de Lola. La sélection montre les huit portraits du garage, dont Malia accompagnée de Pampy, son chien orange.

La carte de partage `race-social.jpg` utilise le même PNG que `title-screen.webp`. Le rendu sRGB de Chromium cadre l’écran titre en 1200 × 630, en conservant sa hauteur et en retirant environ 162 pixels de chacune des marges bleues du fichier d’origine. Le logo et le bouton appartiennent à la capture. Le JPEG de qualité 91 a pour SHA-256 `271a7ae4449d89bc49c32fa993985a848eaef7e4df5ebbc2fa36835e03f21a6f`.
