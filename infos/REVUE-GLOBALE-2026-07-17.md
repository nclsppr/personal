# Revue globale du site - 2026-07-17

Périmètre : les 16 pages publiques (accueil, réalisations, CV, blog et ses
4 articles, en EN + FR), le dashboard personnel, les 10 pages d'erreur.
Méthode : inspection du code, vérifications statiques (titres, hreflang,
typographie, sitemap), captures Chrome headless (desktop 1400/1680 px,
mobile 390 px, clair et sombre). Revue menée en fin de la grosse journée
de travail du 2026-07-17 (blog, dashboard, stickers, DESIGN.md).

## Synthèse

Le site est dans un très bon état : identité forte et tenue (documentation
premium, un seul accent, deux familles d'images), parité FR/EN réelle,
SEO sérieux page par page, accessibilité soignée, performances saines
(statique pur, images optimisées, polices auto-hébergées). La journée a
résolu les grandes incohérences (mesures unifiées 38rem/45rem, typographie
courbe, stickers dans le flux). Restent une poignée de frictions, dont un
vrai bug mobile, listées en fin de document par priorité.

## Revue par page

### Accueil (/, /fr/)
Forces : hero clair, terminal signature, parcours de lecture logique
(apporte, chiffres, réalisations, leadership, blog, au-delà, contact),
nouvelle section « Sur le blog » qui règle la découvrabilité mobile.
Points : les cartes Leadership débordent horizontalement à 390 px (voir
P1) ; « Let's talk. » garde une apostrophe droite ; les intitulés des
cartes Réalisations sont bons depuis le dédoublonnage.

### Réalisations (/work/)
Forces : après la refonte du jour, les études de cas se lisent comme les
articles (flux unique 38rem, stickers habillés par le texte, ombre
discrète, positions variées façon carnet). Le storytelling
problème/contribution/décisions/résultats fonctionne.
Points : les sections hors études de cas (intro, principes, socle
technique) restent à pleine largeur de colonne, la page a donc deux
rythmes de mesure (voir P2) ; une apostrophe droite résiduelle
(« platform's ») ; le TODO IMPACT (vrais chiffres d'effet) est toujours
ouvert côté Nicolas.

### CV (/cv/)
Forces : document propre, imprimable, PDF synchronisés par hook, en-tête
riche (JSON-LD Person complet). Nav à jour avec le blog.
Points : trois apostrophes droites (« Master's », « Bachelor's »,
« platform's ») ; rien d'autre à signaler.

### Blog (index + 4 articles)
Forces : la meilleure surface du site aujourd'hui. Index antichronologique
aux metas empilées, articles à la voix constante, datés sur l'année,
illustrés (série sticker cohérente), SEO complet par article (OG dédiées,
BlogPosting, hreflang), façade vidéo sans tracking, diagramme aux tokens.
Grille 38/45rem exemplaire.
Points : les index du blog utilisent encore og-home.png en partage (voir
P2) ; pas de flux RSS (voir P2) ; la chaîne page-next est chronologique
(enterprise vers sdlc), cohérente avec les nouvelles dates.

### Dashboard (/dashboard/)
Forces : panneaux au thème, sparklines sobres, statuts toujours libellés,
curseur de terminal charmant, noindex + robots corrects.
Points : données d'exemple en attente de vrais flux (data-metric/
data-feed prêts) ; nav d'en-tête légèrement différente des autres pages
(pas de Contact) ; assumé personnel, faible priorité.

### Pages d'erreur (404 + 4xx/5xx)
Forces : gabarit terminal « echo $? » réjouissant, Pampy et ses
animations dans le budget delight, bilingues, noindex.
Points : GitHub Pages ne sert nativement que la 404 (documenté, les
autres attendent un hébergement qui mappe error_page).

## Cohérence transversale

- **Identité** : un accent, deux familles d'images (Swiss quand l'image
  porte une information, sticker quand elle raconte), composants
  partagés partout. DESIGN.md fixe désormais la doctrine. Solide.
- **Typographie** : courbe et cohérente dans le blog ; cinq apostrophes
  droites résiduelles sur accueil/réalisations/CV (P3, cinq minutes).
- **Mesures** : articles et études de cas partagent 38rem ; l'accueil et
  le CV ont leurs propres rythmes, voulus. Seule la page Réalisations
  mélange deux rythmes (P2).
- **i18n** : parité structurelle et sémantique vérifiée, slugs partagés,
  hreflang réciproques partout (5 à 6 par page), lang-switch profond.
- **SEO** : titres uniques au motif constant, descriptions calibrées,
  JSON-LD par type de page, sitemap complet à jour, .nojekyll fiabilise
  les déploiements. Vérification Bing en place (soumission du sitemap à
  faire côté Nicolas).
- **Technique** : statique pur tenu, aucun CDN, hooks de commit
  efficaces (parité, tirets, PDF CV), images pipeline Pillow. CHANGELOG
  riche (13 entrées aujourd'hui).
- **Accessibilité** : skip-links, aria-current, alt bilingues, hover
  gardé pointer:fine, reduced-motion global, contrastes AA tokens.

## Propositions d'amélioration, par priorité

### P1 - à corriger

1. **Cartes Leadership coupées sur mobile (accueil)** : à 390 px, la
   grille `repeat(auto-fit, minmax(210px, 1fr))` rend deux colonnes et
   la deuxième carte est tronquée au bord (constat par capture ; le
   min-content d'un intitulé force probablement la largeur). Corriger
   (minmax(0/psize réduite, colonne unique sous ~500 px) et vérifier
   les trois cartes à 320/390/560 px. Effort : faible.

### P2 - améliorations à vraie valeur

2. **Harmoniser les mesures de la page Réalisations** : caper aussi
   l'intro, les principes et le socle technique à la grille 38/45rem
   pour que toute la page respire au même rythme que les études de cas
   et les articles. Effort : faible.
3. **OG dédiée pour les index du blog** : une déclinaison de la
   miniature du site avec la mention du blog (gabarit Swiss, comme
   og-home), pour que le partage de /blog/ ne soit pas générique.
   Effort : faible (réutiliser scripts/generate-og-image.sh).
4. **Flux RSS du blog** (blog/feed.xml EN + FR) : statique, généré à la
   main ou par petit script au moment d'ajouter un article (à intégrer
   au template /add-article). Fidélise les lecteurs techniques, zéro
   dépendance. Effort : moyen-faible.
5. **Dashboard : brancher un premier vrai flux** pour amorcer (le plus
   simple : stats Claude Code locales via script cron qui committe les
   data-metric). Effort : moyen.
6. **Mini-stickers des cartes Réalisations sur l'accueil** (idée déjà
   ouverte lors de la revue du 2026-07-17 matin) : réutiliser les
   stickers existants en petit dans les cartes « Selected work »,
   renforcerait la série sans nouvel asset. Effort : faible.

### P3 - polissage

7. **Cinq apostrophes droites résiduelles** (accueil « Let's talk. »,
   réalisations « platform's », CV « Master's/Bachelor's/platform's ») :
   passer en apostrophes courbes. Effort : minimal.
8. **Nav du dashboard** : aligner sur la nav standard (ajouter Contact)
   ou assumer la différence en la documentant dans DESIGN.md.
9. **CHANGELOG** : prévoir une archive par année quand le fichier
   deviendra long (déjà 13 entrées pour la seule journée du 17 juillet).
10. **Curseur de terminal** : le dashboard en a un (métaphore tail -f),
    les autres terminaux non ; c'est défendable, à documenter dans
    DESIGN.md pour que ce ne soit pas perçu comme un oubli.

### Actions côté Nicolas (bloquées sur toi)

- Soumettre le sitemap dans Bing Webmaster Tools (vérification déjà en
  place) et vérifier la Search Console Google.
- Fournir les vrais chiffres du TODO IMPACT (études de cas et
  leadership : effets mesurés) ; rien ne sera inventé sans toi.
- DNS : la redirection 301 nicolas.pieper.fr vers nicolaspieper.com
  reste à configurer chez le registrar (décision de 2026-07-14).
