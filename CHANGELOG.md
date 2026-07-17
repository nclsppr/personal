# Journal de bord - nicolaspieper.com

Historique des interventions sur le site, la plus récente en premier.
(Tenu dans le README jusqu'au 2026-07-15, puis déplacé ici.)

---

## 2026-07-17 - SEO : vérification Bing Webmaster Tools

- BingSiteAuth.xml ajouté à la racine pour prouver la propriété du domaine
  auprès de Bing (indexation via Bing Webmaster Tools).
- Balise meta msvalidate.01 ajoutée au head des deux accueils (EN + FR),
  à conserver même après validation. La troisième méthode proposée par
  Bing (CNAME 746abb7e... vers verify.bing.com) n'est pas nécessaire,
  une seule méthode suffit ; elle se ferait dans la zone DNS chez OVH.

## 2026-07-17 - Pages d'erreur : le terminal rejoue l'erreur

- La 404 gagne la marque du site et un terminal qui rejoue l'erreur en
  session zsh (« echo $? » renvoie 404). Elle garde son entrée en fondu
  décalé, ses textes bilingues et ses boutons ; les styles partagés
  migrent de l'inline vers site.css (sous-section « Pages d'erreur »).
- Neuf pages sœurs au même gabarit : 400, 401, 403, 410, 429, 500, 502,
  503 et 504, chacune avec sa propre scène (curl malformé, ssh refusé,
  cat interdit, git log d'une page retirée exprès, boucle curl limitée,
  segfault du renderer, passerelle muette, service en maintenance,
  upstream trop lent). Toutes en noindex.
- GitHub Pages ne sert nativement que 404.html : les autres pages sont
  prêtes pour un hébergement capable de mapper error_page (nginx, CDN)
  et restent consultables en accès direct d'ici là.
- Emplacement commenté dans 404.html pour un futur sticker « fetch
  failed » (Pampy rapporte fièrement un bout de page déchiré) ; le fondu
  d'entrée couvre déjà l'enfant supplémentaire.
- Correctif de grille : piste minmax(0, 1fr) sur .err-wrap, sinon une
  piste auto se cale sur le min-content du <pre> du terminal et déborde
  du padding sur mobile (même parade que .layout).

## 2026-07-17 - Dédoublonnage : une idée, une place

Passe anti-répétition sur les pages de contenu (EN + FR), dans la lignée
du terminal recentré du 2026-07-17. Le CV, document autonome, garde ses
recoupements avec la page Réalisations.

- Réalisations, équipe Solutions : l'idée « responsable + suppléant pour que
  rien ne dépende d'une personne » apparaissait trois fois sur la page.
  Les deux premiers axes de management fusionnent, le principe 02 (« Nommer
  le responsable ») se recentre sur la décision, le principe 04 garde le
  partage des connaissances.
- La puce « Équilibrer livraison, opérationnel, dette, modernisation »
  répétait le paragraphe « défi managérial » de la même section : supprimée.
- Études de cas : les Résultats IoT répétaient l'énoncé du Problème (le
  million d'appareils) ; ils disent désormais ce que la refonte a changé.
  Résultats de l'usine documentaire resserrés (le chiffre reste, une fois).
- Accueil : les intitulés des cartes IoT et usine documentaire répétaient
  les chiffres déjà présents dans le lead et les Chiffres clés ; remplacés
  par ce que les chiffres ne disent pas. Rangée de chips des centres
  d'intérêt supprimée (troisième occurrence après le terminal et la prose).

## 2026-07-17 - Micro-animations : bascule de thème et entrée de la 404

Les deux seules opportunités retenues par une passe « find-animation-
opportunities » (skill d'Emil Kowalski, posture de retenue : 5 pistes
rejetées, dont les transitions de pages et tout effet au chargement).

- La bascule de thème échangeait ses icônes soleil/lune par display:none,
  seul changement d'état interactif encore instantané : fondu croisé
  opacité + échelle + flou (0,2 s), les deux icônes superposées dans la
  grille du bouton. Instantané sous prefers-reduced-motion (bloc global).
- La page 404, seul « budget delight » du site (vue rarement), entre en
  fondu décalé : chaque bloc monte de 10 px en 0,35 s (ease-out appuyé),
  décalage de 60 ms, via @starting-style (navigateurs anciens : affichage
  instantané). Opacité et transform uniquement, boutons cliquables pendant
  le fondu.

## 2026-07-17 - SEO : miniature de partage refaite et terminal recentré

- La miniature Open Graph (og-home.png) datait d'avant le rebranding du
  2026-07-15 : ancien carré terracotta « NP » en texte et « 10M docs/month ».
  Refaite aux couleurs actuelles (logo-mark, International Orange, portrait
  sticker, « 10M reports/month »), via un gabarit versionné
  (scripts/og-template.html) et un script de régénération
  (scripts/generate-og-image.sh), documentés dans AGENTS.md. Les URLs
  og:image / twitter:image passent en ?v=2 pour invalider le cache des
  scrapers sociaux.
- sitemap.xml : lastmod aligné sur les dernières modifications (2026-07-17).
- Terminal de l'accueil : la commande « nicolas highlights » et ses trois
  métriques doublonnaient la section Chiffres clés juste en dessous ;
  supprimées (EN + FR, aria-label mis à jour). Le terminal se recentre sur
  whoami et les centres d'intérêt.
- PDF du CV régénérés (meta og:image des pages CV).

## 2026-07-17 - Contre-revue : onze correctifs sur les quatre lots

Une contre-revue adversariale du diff complet (quatre lentilles : couverture
des constats, régressions CSS, règles du dépôt, accessibilité) a confirmé
onze points, tous corrigés ici.

- Impression : le nouveau bloc print de site.css ne réinitialisait pas les
  jetons du thème sombre ; un lecteur en mode sombre imprimait la page
  d'accueil quasi blanche. Reprise du motif de cv.css (palette encre sur
  papier quel que soit le thème).
- Ancres de titres au tactile : 45 % d'opacité sur --muted tombait à ~2:1 ;
  relevé à 75 % (au-dessus de 3:1 dans les deux thèmes).
- Les titres de groupes du footer (Pages, Ailleurs, Site) sont demotés en
  <p class="side-title"> comme ceux de la sidebar : dix-huit <h2> de légende
  polluaient encore le plan des titres.
- Footer tactile : l'espace devant la flèche « ↗ » était rogné par le mode
  flex des liens (LinkedIn↗ collé) ; un column-gap le remplace.
- Tiroir du CV : la page courante (aria-current) est maintenant marquée
  visuellement ; le panneau est scindé en deux <nav> (« Pages » et « Sur
  cette page ») au lieu d'un seul landmark mal étiqueté.
- Le lien LinkedIn de l'en-tête du CV annonce l'ouverture d'un nouvel
  onglet (aria-label, pour ne pas polluer le texte du PDF).
- Boutons de téléchargement : le nom accessible commence par le libellé
  visible (WCAG 2.5.3 Label in Name).
- Pagination empilée sous 720 px : les halos de tap se chevauchaient de
  4 px ; l'écart passe à 28 px.
- Journal : le contraste du lien d'évitement en sombre est 6,3:1 (et non
  6,2:1) et la description de l'impasse mobile du CV surestimait le
  problème (fil d'Ariane et pagination existaient déjà) ; corrigés.
- PDF du CV régénérés (libellés accessibles modifiés sur les pages CV).

## 2026-07-17 - Hygiène : contrastes, impression, CSS mort et signaux externes

Quatrième et dernier lot de la revue de design.

- Le lien d'évitement (« Aller au contenu ») passait à 2,4:1 en thème sombre
  (blanc codé en dur sur orange clair) : il reprend l'inversion des boutons
  (color: var(--bg)), 5,1:1 en clair et 6,3:1 en sombre.
- Les ombres des stickers deviennent un jeton thémé (--sticker-shadow-ink)
  avec une variante sombre plus marquée, comme --shadow-1/2.
- Impression des pages hors CV : palette encre sur papier et chrome masqué ;
  le terminal et le panneau contact imprimaient blanc sur blanc.
- Le CTA du hero pointe vers le panneau contact au lieu d'un mailto direct
  qui échouait sans retour sur les postes sans client mail ; le panneau
  montre l'adresse copiable.
- Liens externes (LinkedIn, GitHub, Source, panneau contact) : flèche « ↗ »
  et mention « (opens in a new tab) » / « (s'ouvre dans un nouvel onglet) »
  pour lecteurs d'écran ; libellés des boutons d'icône complétés.
- Les étiquettes de groupes de la sidebar passent de <h2> à <p class="side-title"> :
  elles précédaient le h1 dans le plan des titres au clavier/lecteur d'écran.
- JetBrains Mono est préchargée (elle rend l'eyebrow et le fil d'Ariane dès le
  premier écran) ; le premier sticker de la page Work passe en loading eager
  (il est au-dessus du pli) et la première étude de cas retrouve son filet,
  que son sticker doit chevaucher.
- Nettoyage : ~95 lignes de CSS mort supprimées (.version-pick, .timeline,
  .edu-list, styles de tables) ; les variables de taille/inclinaison des
  stickers sont cantonnées à .page-work (elles fuyaient sur les ids homonymes
  de la page d'accueil). PDF du CV régénérés (préchargement et footer).

## 2026-07-17 - Micro-interactions : transitions du chrome et stickers apaisés

Troisième lot de la revue de design. Aucun changement de mise en page,
uniquement la qualité du mouvement et la sincérité des affordances.

- Le chrome interactif (boutons d'icône, nav du header, sidebar, pilules de
  langue, liens du footer, fil d'Ariane, marque) fond désormais ses survols
  en 0.15 s comme les .btn ; avant, ces états claquaient instantanément à
  côté d'éléments qui fondent. Le passage d'état du scrollspy en profite.
- Les boutons d'icône gagnent un retour d'appui (scale 0.96 au :active) et
  la marque un survol discret couleur accent.
- Stickers : l'entrée en survol garde sa courbe à ressort, la sortie se pose
  en 0.25 s ease-out au lieu de rejouer le rebond. Les survols sont réservés
  aux vrais pointeurs (hover: hover + pointer: fine) : au tap, Pampy restait
  collé en rotation.
- Les ancres de titres (#) apparaissent en fondu, restent visibles à 45 %
  d'opacité sur écrans tactiles et y gagnent une zone de tap honnête.
- Les cartes Leadership et les principes, non cliquables, perdent leur survol
  qui promettait un clic ; l'élévation est réservée aux cartes-liens.

## 2026-07-17 - CV : navigation mobile, petites capitales et liens de contact

Deuxième lot de la revue de design.

- Les pages CV étaient les seules sans hamburger : sous 980 px, elles
  n'offraient aucune navigation de site dans le header (seuls le logo, le
  fil d'Ariane, la pagination de bas de page et le footer permettaient d'en
  sortir), alors qu'un recruteur arrive souvent directement sur /cv/ par un
  lien. Elles reçoivent
  le tiroir mobile des autres pages (bouton menu, backdrop, panneau avec
  groupes « Pages » et « Sur cette page », scrollspy actif), masqué sur
  desktop où la colonne unique reste inchangée.
- Les titres de sections du CV (PROFILE, EXPERIENCE...) rendaient à ~70 % de
  leur taille déclarée : JetBrains Mono n'a pas de vraies petites capitales
  et le navigateur les synthétisait. font-variant-caps retiré, l'uppercase et
  l'interlettrage suffisent ; les kickers retrouvent la taille du reste du
  système, à l'écran comme dans le PDF.
- Les liens de contact de l'en-tête (mail, LinkedIn, site) étaient
  indistinguables du texte voisin : souligné discret couleur filet, retiré
  à l'impression.
- Le bouton de téléchargement annonce le poids du fichier : « Download PDF
  (0.3 MB) » / « Télécharger le PDF (0,3 Mo) ». PDF régénérés.

## 2026-07-17 - Lisibilité : habillage mobile, mesure et cibles tactiles

Premier lot d'une revue de design complète (37 agents + inspection navigateur,
constats vérifiés sur pièces ; score Nielsen 32/40).

- Le portrait du hero écrasait l'accroche à 2-3 mots par ligne sur mobile
  (EN + FR) : cap réduit à 112 px / 30 vw, accroche à 1.05 rem sous 560 px,
  césure automatique du français (hyphens: auto). Même motif sur les stickers
  des études de cas : 118 px / 33 vw sous 720 px pour garder une colonne de
  texte d'au moins ~200 px.
- La mesure du texte courant plafonne à 60ch (~77 caractères réels) : les
  paragraphes pleine largeur montaient à ~96 caractères par ligne, au-delà de
  la zone de confort. Les composants (terminal, grilles, filets) gardent la
  pleine largeur.
- Retours à la ligne : text-wrap balance sur h1/h2, pretty sur les paragraphes ;
  le saut de ligne volontaire du h1 est neutralisé sous 560 px (espace ajoutée
  avant le <br> pour que les mots ne se collent pas).
- Cibles tactiles complétées (pointer: coarse) : liens texte « Lire l'étude de
  cas », fil d'Ariane, pagination et pilules de langue atteignent ~44 px, les
  boutons passent à min-height 44 px.
- La légende du sticker Pampy est épinglée au bas de la figure (position
  absolute) : l'ancien recouvrement en marge négative relative à la largeur
  échouait entre 500 et 560 px. Taille relevée à 0.72 rem, plancher de
  lisibilité du mono.

## 2026-07-16 - Footer colophon, portrait mobile et fil d'Ariane restauré

- Nouveau footer identique sur les six pages, en forme de colophon : identité
  (monogramme, rôle, clin d'œil terminal « $ exit 0 »), trois colonnes de liens
  dans la langue mono de la sidebar (Pages / Ailleurs / Site, page courante en
  orange), et une ligne de base typographique (« Composé en Inter, Source
  Serif 4 & JetBrains Mono. Site statique, sans tracking. »).
- Corrige la hauteur aléatoire de l'ancien footer sur Chrome mobile : la règle
  tactile de 44 px s'appliquait à des liens en ligne qui wrappaient différemment
  selon le navigateur ; chaque lien est désormais un bloc à hauteur voulue.
- Le fil d'Ariane des pages d'accueil, masqué sur mobile par un audit précédent,
  est restauré pour rester cohérent avec Work et CV.
- Le portrait du hero, bloc centré qui coupait la page en deux sur mobile, est
  flotté à droite avec habillage du texte, comme les stickers de la page Work.
- Gras et marqueurs sur la page Work : une phrase-clé par bloc dans les sections
  01/02, marqueur orange sur les deux métriques phares (1 M+, 10 M), EN + FR.

## 2026-07-16 - Bannissement des tirets longs

- Passe complète sur le dépôt (pages HTML, titres, meta, JSON-LD, CV, 404, docs,
  commentaires de code) : plus aucun tiret cadratin, demi-cadratin ni barre
  horizontale. Remplacés par « · » (séparateurs du site : titres de pages, footer,
  organisations, langues), « - » (plages de dates, docs) ou une reformulation
  (incises de prose).
- Règle AGENTS.md durcie : interdiction totale, sans exception (l'ancienne règle
  tolérait les usages « légitimes »).
- Nouveau hook `git commit` (`check-no-emdash.py`) qui bloque toute occurrence
  dans les fichiers texte stagés, archive `v2022/` exclue. PDF des CV régénérés.

## 2026-07-16 - Stickers Work agrandis et « claqués » sur la page

- Les stickers des études de cas gagnent en présence : 170-210 px sur desktop
  (au lieu de 118-156), ~148 px sur mobile (au lieu de 84), sources régénérées
  en 512 px depuis les originaux pour rester nets en retina.
- Placement moins scolaire : chaque sticker chevauche le filet séparateur de
  section et déborde dans la marge droite sur grand écran ; sur mobile il est
  flotté à droite avec habillage du texte. Taille et angle par sticker portés
  par le CSS (plus de styles inline), la réserve du titre suit la largeur réelle.
- Navigation de fin de page ajoutée aux CV (« Retour à l'Aperçu / explorer les
  réalisations »), masquée à l'impression, PDF régénérés.

## 2026-07-15 - Page Work recentrée sur le rôle actuel

- L'étude de cas « Plateformes sécurisées » est remplacée par deux sections : « Diriger
  l'équipe d'ingénierie Solutions » (01, management, nouveau sticker die-cut optimisé
  2,5 Mo → 53 Ko) puis « Plateformes sécurisées de documents & de communication »
  (02, direction produit et plateforme), EN + FR. L'IoT et l'usine documentaire passent
  en 03 et 04.
- « Leadership in practice », redondant avec la nouvelle section 01, est supprimé ;
  l'ancre `#leadership-in-practice` est redirigée vers `#solutions-team` (alias legacy
  dans site.js) et le lien homepage « Découvrir le leadership en pratique » pointe
  désormais vers la section 01.
- La homepage liste les quatre études de cas dans le même ordre, avec un nouveau
  résumé « 10 ingénieurs, un portefeuille » pour l'équipe Solutions.
- Sidebar, intro, meta et JSON-LD alignés ; la grille des études de cas accepte
  plusieurs paragraphes par libellé (placement colonne 2 généralisé).

## 2026-07-15 - Favicon aligné sur le monogramme NP

- Le favicon SVG typographique est remplacé par une version vectorielle simplifiée du
  monogramme de `logo_nicolaspieper.png`, lisible aux tailles 16 et 32 px.
- Le fallback PNG 96 px est régénéré directement depuis le logo maître ; l’icône Apple,
  déjà cohérente avec ce monogramme, reste inchangée.
- Les URLs de favicon sont versionnées pour invalider le cache des navigateurs.

## 2026-07-15 - Stickers des études de cas sur la page Work

- Trois stickers die-cut (IoT, usine documentaire, plateformes sécurisées) accrochés près
  des repères 01/02/03 des études de cas, EN + FR, dans la langue graphique des stickers
  existants (gravure vintage, ivoire, International Orange, inclinaison, ombre portée).
- Desktop : position absolue à droite du titre (tailles 118/156/132 px, le Document Factory
  domine) ; mobile ≤ 720 px : dans le flux sous le titre, ~84 px.
- Optimisation lourde des sources : détourage du fond noir du Document Factory (flood fill),
  recadrage alpha, redimensionnement 400 px et quantization palette - 6,5 Mo → 145 Ko au total.
- Chargement paresseux, `alt` descriptifs bilingues, `prefers-reduced-motion` respecté.

## 2026-07-15 - Surlignage « marqueur » des faits clés

- Nouveau style `mark.hl` : un surlignage discret teinté `--accent-soft` (calibré thèmes
  clair et sombre), réservé aux un ou deux faits qu'un visiteur doit retenir d'une page.
- Appliqué aux deux métriques du hero de la homepage (EN + FR) : « un million d'appareils
  connectés » et « 10 millions de rapports par mois ». « 10 ans » reste en gras simple.
- Parti pris : pas d'International Orange pur en fond de texte (contraste), élément `<mark>`
  sémantique, et pages CV volontairement exclues (sobriété du PDF).

## 2026-07-15 - Régénération automatisée des PDF du CV

- Ajout de `scripts/generate-cv-pdf.sh` qui régénère les deux PDF téléchargeables
  (`assets/docs/nicolas-pieper-cv-{en,fr}.pdf`) à partir des pages `/cv/` et `/fr/cv/`
  via Chrome headless, en appliquant les styles d’impression de `assets/css/cv.css`.
- Nouvelle règle dans `AGENTS.md` (§ « CV PDF ») : toute modification d’une page CV impose
  de régénérer les PDF et de les committer avec la page.
- Un hook `git commit` (`check-cv-pdf.py`) bloque le commit si une page CV est stagée sans
  son PDF régénéré, au même titre que le hook de parité FR/EN.
- Parité FR/EN vérifiée : les deux pages téléchargent bien un vrai PDF (le bouton
  « imprimer » anglais avait déjà été remplacé le même jour).

## 2026-07-15 - CV recentré et PDF pré-générés

- Les expériences de stage de 2015-2016 et le poste de technicien de 2011 sont retirés des CV
  anglais et français ; le parcours professionnel présenté commence au poste de Lead Developer
  en 2016. La formation reste inchangée.
- Les boutons d’impression sont remplacés par le téléchargement direct de deux PDF statiques,
  un par langue, générés à partir des pages CV et versionnés dans `assets/docs/`.
- La mise en page d’impression tient sur deux pages lisibles dans chaque langue, avec chaque
  poste conservé d’un seul bloc. Les pages HTML restent accessibles et imprimables sans JavaScript.

## 2026-07-15 - Terminal d’accueil plus personnel

- Le terminal ne répète plus les principes détaillés sur la page Work.
- La commande fictive `nicolas highlights` rappelle les trois faits déjà publiés : plus d’un
  million d’appareils connectés, 10 millions de rapports par mois et une équipe de dix ingénieurs.
- `ls interests/` ajoute une touche personnelle avec la domotique, la randonnée et la pizza
  napolitaine. Le libellé accessible est équivalent en anglais et en français.

## 2026-07-15 - Scrollspy fiable sur les sections courtes

- La section « Beyond engineering / Au-delà de l’ingénierie » active désormais correctement
  son entrée de sidebar lorsqu’elle franchit le repère de lecture.
- Le scrollspy suit la dernière section dont le début a franchi ce repère, au lieu de dépendre
  d’une bande d’intersection qui pouvait manquer les blocs courts.
- Les sept destinations ont été contrôlées en anglais et en français, sur mobile et desktop.

## 2026-07-15 - Finition design, prose et navigation mobile

- **Direction visuelle** : rayons resserrés sur le logo, les boutons et les composants pour
  renforcer l’esprit « documentation premium » ; orange international utilisé comme repère
  éditorial dans le header et les études de cas, sans surcharger les pages.
- **Page Work** : composition éditoriale en deux colonnes sur desktop, repères numérotés,
  libellés de lecture et navigation de fin de page ; retour en une colonne sur mobile.
- **Interactions utiles** : transformation du bouton menu en fermeture, libellé dynamique,
  piège de focus, restitution du focus et fond réellement inerte lorsque le tiroir est ouvert.
- **Prose FR/EN** : formulations génériques ou répétitives remplacées par des phrases plus
  directes, sans modifier les faits ni les chiffres ; principes du terminal et de Work alignés.
- **CV imprimé** : pagination affinée pour conserver des blocs lisibles et produire trois pages
  propres dans les deux langues, sans titre isolé en bas de page.
- **Contrôles** : rendu desktop et mobile, thèmes clair et sombre, structure FR/EN,
  navigation, débordements horizontaux et PDF des deux CV vérifiés.

## 2026-07-15 - Architecture Overview / Work / CV

- **Nouvelle page bilingue** : ajout de `/work/` et `/fr/work/` pour les trois études de cas,
  le leadership détaillé, les principes d’ingénierie et le socle technique.
- **Homepage executive summary** : réduction à sept destinations exhaustives dans la sidebar ;
  études de cas remplacées par trois résumés et leadership ramené à trois exemples.
- **CV comme référence** : parcours et formation retirés de la homepage, sans modification de
  leur contenu dans les CV.
- **Navigation et compatibilité** : header Overview / Work / CV / Contact sur les pages
  professionnelles, deep-link bilingue étendu à Work et redirections des anciennes ancres.
- **SEO et documentation** : canonical, hreflang, métadonnées sociales, JSON-LD, sitemap et
  README mis à jour. Aucun chiffre ni fait professionnel ajouté.

## 2026-07-15 - Restructuration de la homepage (audit Phase 1)

Homepage raccourcie (~30 %) sans perdre les preuves, le détail restant dans le CV.
Aucun fait ni chiffre modifié ; l'impact chiffré reste en TODO (voir mémoire).

- **Nav sidebar réduite** : de 4 groupes / 13 liens à 4 groupes / 11 liens. « Platforms »
  renommé « Selected impact / Expériences sélectionnées ». Retirés de la nav : Current focus,
  Career journey, Technical background, Education (les sections et leurs ancres restent en place).
- **Terminal → principes** : le terminal du hero ne répète plus les 3 métriques (déjà dans
  « Key numbers ») ; il affiche `principles.txt` (Give context / Make ownership explicit /
  Stay close to production / Build teams, not heroes). `aria-label` mis à jour.
- **Listes condensées** (3-5 items) : « What I bring » 8 → 4 piliers ; « How I lead » 6 → 4
  (les principes « challenge complexity » et « create room » intégrés dans les descriptions) ;
  « Current focus » 10 → 5 ; puces des études de cas IoT et usine documentaire 7 → 5.
- **Parcours homepage allégé** : stages 2015-16 et technicien 2011 retirés de la homepage
  (conservés dans le CV).
- **Activité indépendante clarifiée** : « Independent Software Engineer · Selected projects »
  / « Ingénieur logiciel indépendant · Projets sélectionnés » (homepage + CV) - n'apparaît
  plus comme une activité pleinement active en parallèle de l'emploi.
- **Beyond engineering condensé** : liste de 6 puces → un paragraphe + 3 tags (Home automation /
  Hiking / Neapolitan pizza). La ligne sur le « proxy d'entreprise » (critique implicite de
  l'employeur) est retirée.

Parité FR/EN vérifiée (15 sections identiques, 11 liens nav, comptes de listes égaux) ;
rendu et absence d'erreur console contrôlés dans le panneau.

## 2026-07-15 - Passe d'audit : prose « dé-IA », accessibilité, titre, hygiène repo

Application d'une partie du plan d'audit, en priorisant les items ne nécessitant
aucune validation de contenu.

- **Prose « dé-IA »** : les tirets cadratins d'incise (tic d'écriture assistée par IA)
  sont retirés de la prose FR/EN sur l'accueil et les CV, réécrits en virgules,
  deux-points ou phrases scindées. Les tirets typographiques légitimes (titres, plages
  de dates, séparateurs organisation/langue, terminal, footer) sont conservés. Aucun fait
  ni chiffre modifié ; parité FR/EN préservée.
- **Accessibilité (Phase 3 de l'audit, `assets/js/site.js`)** : bouton de thème avec
  `aria-label` dynamique bilingue + `aria-pressed` (synchro au chargement et au clic) ;
  scrollspy exposant `aria-current="location"` sur le lien actif ; tiroir mobile traité
  comme modal (verrou du scroll de fond `body.nav-open` + `inert` sur le contenu principal).
- **UX** : portrait du hero chargé en priorité (`loading="eager"` + `fetchpriority="high"`) ;
  breadcrumb de la homepage masqué sur mobile ; sélecteur `v2026 · v2022` retiré de la
  sidebar (l'archive reste dans le footer) ; bouton CV renommé « Print or save as PDF » /
  « Imprimer ou enregistrer en PDF » (il déclenche `window.print()`).
- **Titre** : « Engineering Manager » adopté partout (hero, meta, JSON-LD étaient déjà
  alignés) ; toute mention « Engineering Supervisor » retirée du parcours et du leadership,
  sur les 4 pages.
- **Docs** : README recentré sur la documentation projet, ce journal déplacé dans
  `CHANGELOG.md`, ajout d'un `AGENTS.md` (règles pour les interventions automatisées).

## 2026-07-15 - Portrait sticker sur l'accueil, photo sur les CV, favicon orange

- **Favicon en International Orange** : `favicon.svg` passe de terracotta à #FF4F00 (carré NP
  crème). `favicon-96.png` régénéré depuis le SVG via qlmanage.
- **Accueil (`/` et `/fr/`)** : la photo `nicolas-pieper.jpg` est remplacée par le portrait
  illustré `nicolas-sticker.png`. Le `.portrait` perd sa carte (bordure/rayon/ombre) au profit
  d'un `drop-shadow` qui épouse la découpe.
  ⚠️ **Détourage nécessaire** : le PNG fourni (généré par IA) n'avait **pas** de transparence
  - un fond **blanc opaque** était intégré (colortype 2, sans alpha), invisible sur fond blanc
  mais formant un rectangle blanc sur l'ivoire/sombre du site. Corrigé par un flood-fill depuis
  les bords (script Python maison, sans dépendance) : le fond blanc **neutre** (R=G=B) est rendu
  transparent, en s'arrêtant au contour **crème chaud** du die-cut (R>G>B) ; le blanc intérieur
  (chemise) est enclavé donc préservé. Downscale premultiplié → RGBA 460 px (~420 Ko). Vérifié
  clair + sombre : plus de rectangle, découpe nette.
- **CV (`/cv/` et `/fr/cv/`)** : la photo `nicolas-pieper.jpg` est ajoutée dans l'en-tête, qui
  devient un flex (texte + `.cv-photo` à droite, ~84-112 px, coins arrondis). S'imprime avec le CV.

## 2026-07-15 - Identité de marque : logo + International Orange (#FF4F00)

Nouveau logo `assets/img/logo_nicolaspieper.png` (carré orange, monogramme NP crème,
traits noirs). Deux volets : le logo comme marque, et l'orange dans le design system.

**Logo dans le header** - le carré « NP » textuel (`.brand-mark`) est remplacé par une
image du logo (`assets/img/logo-mark.png`, 128 px, ~16 Ko, généré via sips) sur les 4 pages.
Toujours visible dans le header fixe, y compris en mobile (où le texte « Nicolas Pieper » se
masque, le mark devient l'identité). Un `aria-label="Nicolas Pieper"` est ajouté au lien
`.brand` : le nom accessible reste stable même quand le texte visible disparaît (mobile).
`apple-touch-icon.png` régénéré depuis le logo (180 px). Master optimisé 994 Ko → 242 Ko
(512 px). Le `favicon.svg` (mark vectoriel dédié, lisible à 16 px) est conservé tel quel.

**Design system passé à l'International Orange** - l'accent terracotta (#D97757) devient
l'orange du logo. Choix : l'orange vif est réservé aux **petites zones à fort impact**
(logo, puces `::marker`, bordures/pastilles, état actif du menu, focus, CTA de contact),
tandis que le **texte** utilise une déclinaison plus sombre pour rester lisible (WCAG AA) -
la surface calme « documentation » est préservée (les boutons primaires restent neutres).
Tout passe par les tokens `--accent*` (2 hex en dur mis à jour : `::selection`, CTA contact).

Palette (contrastes vérifiés) :
- `--accent` / `--brand` = **#FF4F00** - marks, bordures, focus (clair 3,1:1 · sombre 4,6:1, ≥3:1 UI).
- `--accent-ink` = **#C23C00** clair (5,1:1 sur ivoire) / **#FF8551** sombre (6,3:1) - liens & texte, AA.
- CTA de contact « nicolas@pieper.fr » = fond **#FF4F00**, texte foncé #201203 (5,5:1 AA) - le
  moment de marque le plus fort, sur le panneau sombre.
- `::selection` #C23C00, `--accent-soft`/`--accent-glow` re-teintés orange.

_Vérifié en clair et sombre dans le panneau ; logo net à 30 px, CTA orange lisible._

## 2026-07-15 - Dynamic Island : vrai correctif (recomposition, pas mutation du meta)

Le correctif précédent (mettre à jour `<meta name="theme-color">.content` au toggle) ne
rafraîchissait la Dynamic Island que **quand on ouvrait le menu**. Diagnostic (analyse
multi-agents adversariale) : muter `.content` **livre bien** la nouvelle couleur à iOS
Safari - la preuve, le menu affiche la bonne couleur sans jamais toucher au meta. Ce qui
manque n'est pas la notification mais une **recomposition** de la bande safe-area sous
l'îlot (exposée par `viewport-fit=cover`) : iOS ne la re-échantillonne que sur une
transaction de layer-tree en haut du viewport. Ouvrir le menu (backdrop + sidebar fixes)
en provoque une ; un simple `.content` non.

Correctif (`assets/js/site.js`) : garder la mise à jour `.content` en place (suffisante sur
Android/desktop, préserve l'identité du nœud dont dépend le script anti-flash) **puis**
reproduire délibérément cette recomposition en « poussant » le `.site-header` - déjà promu
en couche via `backdrop-filter` - avec un `transform: translateZ(0)` basculé sur deux
`requestAnimationFrame`. `translateZ` n'a aucun déplacement 2D → transaction de couche sans
flash, et le header revient à son état (vérifié : aucun transform résiduel). _Le repaint de
l'îlot lui-même ne se teste que sur iPhone réel - à confirmer côté Nicolas._

## 2026-07-15 - Sticker Pampy repensé, Formation dans le menu

- **Sticker Pampy** (`assets/css/site.css`, les 2 pages) : l'illustration est un buste dont
  le poitrail se termine par une coupe droite - flottant dans le vide, il semblait « coupé
  en bas ». Nouveau traitement façon sticker réellement collé : légère inclinaison (-6°),
  micro-animation ressort au survol (retour à plat + zoom léger, désactivée sous
  `prefers-reduced-motion`), et une **carte-légende** « Pampy - Chief Pizza Officer »
  (fond `--bg-raised`, mono) qui chevauche le bas du sticker : la coupe disparaît derrière,
  Pampy sort de sa carte. Vérifié en clair et en sombre.
- **Formation trouvable dans le menu** : la sous-partie `<h3>` Education/Formation (nichée
  dans « Au-delà de l'ingénierie ») devient une vraie section `doc-section` avec titre ancré,
  et gagne son entrée dans la sidebar (groupe Référence) sur les deux langues. L'ancre
  `#education` est conservée ; le scrollspy la prend en charge automatiquement.

## 2026-07-15 - Parité FR/EN, corrections UX (thème iOS, scrollspy, deep-link langue)

Signalements de Nicolas + mise en place d'une règle de parité entre les deux langues.

- **Fil d'Ariane FR corrigé** : `fr/index.html` affichait `nicolaspieper.com / fr` au lieu
  de `nicolaspieper.com / aperçu` (le libellé EN équivalent est « overview »). Un placeholder
  `fr` restait à la place du libellé traduit.
- **Deep-link au changement de langue** (`assets/js/site.js`) : les liens EN⇄FR (en-tête et
  pied de page) reçoivent désormais l'ancre de la section courante suivie par le scrollspy.
  Changer de langue conserve l'endroit où on était dans la page (les `id` de section sont
  identiques dans les deux langues). Fonctionne même après un défilement manuel.
- **Barre d'état iOS synchronisée au thème** : les deux `<meta name="theme-color">` en
  `media=(prefers-color-scheme)` ne suivaient que la préférence système, pas le bouton
  jour/nuit du site - la Dynamic Island gardait donc l'ancienne couleur au changement manuel.
  Remplacés par un seul `<meta name="theme-color">` piloté en JS (script anti-flash de `<head>`
  + toggle) : `#FAF9F5` en clair, `#262624` en sombre. Appliqué aux 5 pages (dont `404.html`).
- **Scrollspy - section Contact** : la dernière section, trop courte, n'entrait jamais dans
  la bande de détection de l'`IntersectionObserver` → son entrée de menu ne s'allumait jamais.
  Ajout d'une détection de bas de page (throttlée en `requestAnimationFrame`) qui épingle le
  dernier lien du menu quand la page est défilée jusqu'en bas.

**Règle de parité FR/EN (imposée par Nicolas) :** avant chaque commit touchant le site,
vérifier que `/` et `/fr/` restent équivalents (même structure, mêmes sections, et chaque
texte est la traduction équivalente - aucun texte source oublié, aucun placeholder). Un hook
`git commit` (`~/Developer/.claude/hooks/check-i18n-parity.py`) bloque désormais le commit si
la parité *structurelle* diverge (sections/ancres désynchronisées, fil d'Ariane FR = code
langue). La parité *sémantique* reste vérifiée par relecture.

_Vérifié dans le panneau navigateur : fil d'Ariane, bascule theme-color et deep-link langue OK.
Le scrollspy dépend de `innerHeight` (rapporté à 0 par le panneau) → à confirmer sur iPhone réel._

## 2026-07-15 - Responsivité iPhone (safe areas, notch, tap targets)

Passe dédiée au rendu sur iPhone (testé/pensé pour iPhone 15, 393×852). Le layout de base
était fluide mais ne respectait pas les règles de navigation iOS. Corrections dans
`assets/css/site.css`, `assets/css/cv.css`, `404.html` et le `<meta viewport>` des 5 pages :

- **Zones de sécurité (encoche / Dynamic Island / indicateur d'accueil)** : ajout de
  `viewport-fit=cover` + tokens `env(safe-area-inset-*)`. L'en-tête fixe réserve désormais
  la hauteur de la barre d'état (`--header-offset`), le contenu et le tiroir mobile
  dégagent l'indicateur d'accueil en bas, et le contenu respecte les encoches latérales
  en paysage.
- **Bug `100vh` iOS Safari** : sidebar et pages passées en `100dvh` (la barre d'outils
  Safari ne tronque plus le bas).
- **Cibles tactiles** : boutons d'icône 34 → 40 px, portés à 44 px (min. Apple HIG) sur
  `@media (pointer: coarse)` ; zones tap agrandies pour le sélecteur de langue et la nav.
- **Confort iOS** : `overflow-x: clip` (garde anti-défilement horizontal),
  `-webkit-tap-highlight-color: transparent` (pas de flash gris au tap),
  `overscroll-behavior: contain` sur le tiroir.

Sur un appareil sans encoche, tous les `env()` valent 0 → rendu identique à avant (aucune
régression desktop). Vérifié via simulation d'encoche + valeurs calculées ; le test
définitif se fera sur l'iPhone réel une fois le DNS en place.

**Décision i18n :** on conserve **deux fichiers HTML** distincts (`/` et `/fr/`) plutôt
qu'une traduction JavaScript runtime - choix dicté par la priorité SEO (aperçus de partage
et `hreflang` nécessitent des pages pré-rendues par URL). Les deux versions sont maintenues
à la main et gardées synchronisées.

## 2026-07-15 - Audit qualité multi-agents et corrections

Passe d'audit adversariale (12 agents : SEO technique, WCAG 2.2 AA, relecture française,
fidélité au contenu source, intégrité des liens). 29 findings bruts, 7 majeurs confirmés
après contre-vérification, 22 mineurs - tous corrigés :

- **Accessibilité** : contraste du CTA contact (3.12:1 → 6.21:1), ancres de titres
  désormais visibles au focus clavier, drawer mobile retiré de l'ordre de tabulation
  quand il est fermé (`visibility`) + retour du focus au bouton menu, anneau de focus
  conforme (≥3:1), contrastes du bloc terminal relevés, `::selection` conforme,
  attributs `lang` sur les liens en langue étrangère.
- **Contenu** : section « Current focus / Priorités actuelles » (priorité 88 % dans
  INFOS.md) ajoutée aux deux homepages ; « Site reliability engineering » (non sourcé)
  remplacé par « Production engineering » dans les JSON-LD ; « Engineering roles »
  → « Engineering internships » (fidélité aux sources).
- **Français** : « d'accounting » → « de traçabilité », grammaire (« ne doit pas *nous*
  éloigner »), harmonisation terminologique entre pages FR (appareils connectés,
  exigences métier, preuve de concept, titres de postes en anglais), apostrophes
  typographiques (140 remplacements), espaces insécables dans les métas.
- **SEO** : titres raccourcis ≤65 caractères avec « Luxembourg » dans les deux langues,
  meta descriptions ramenées à ~150 caractères, breadcrumbs FR pointant vers /fr/.

## 2026-07-14 - Refonte complète v2026

Refonte totale du site, réalisée avec Claude Code (Opus 4.8 + Fable 5). L'ancienne version
« pizza » (2024) est remplacée par un design inspiré des documentations Claude AI : sobre,
ivoire/encre, une seule couleur d'accent (terracotta `#D97757`), typographie serif pour les
titres (Source Serif 4), Inter pour le corps, JetBrains Mono pour les touches techniques.

### Concept

Le site se présente comme **la documentation de Nicolas Pieper** : sidebar de navigation
par groupes (Get started / Platforms / Leadership / Reference), scrollspy, ancres sur les
titres, breadcrumb, sélecteur de version (v2026 · v2022) qui pointe vers l'archive de
l'ancien site conservée dans [`/v2022/`](v2022/).

### Architecture

| URL | Contenu |
| --- | --- |
| `/` | Homepage anglaise (langue par défaut) |
| `/fr/` | Homepage française |
| `/cv/` | CV anglais (imprimable → PDF via `window.print()`) |
| `/fr/cv/` | CV français |
| `/v2022/` | Archive de la version 2022 (non indexée) |
| `/infos/` | Source de contenu ([INFOS.md](infos/INFOS.md), non indexée) |

### Décisions techniques

- **Bilinguisme par URLs distinctes** (`/` EN, `/fr/` FR) avec `hreflang` réciproques,
  au lieu de l'ancien toggle JavaScript invisible pour les moteurs de recherche.
- **Domaine canonique : nicolaspieper.com** (fichier `CNAME`). GitHub Pages n'accepte
  qu'un domaine custom par repo → `nicolas.pieper.fr` doit être configuré en
  redirection 301 chez le registrar (voir TODO).
- **Polices auto-hébergées** (woff2 variables, sous-ensembles latin + latin-ext,
  ~270 Ko au total) : performance (pas de requête tierce) et conformité RGPD
  (pas de transfert d'IP vers Google Fonts).
- **Thème clair/sombre** : bascule manuelle persistée en `localStorage`, défaut aligné
  sur `prefers-color-scheme`, script inline anti-flash dans le `<head>`.
- **Zéro dépendance** : pas de framework, pas de CDN, un seul fichier JS (~2 Ko)
  pour le thème, la sidebar mobile et le scrollspy.
- **Images générées localement** : favicon SVG (monogramme NP), PNG dérivés et image
  OpenGraph 1200×630 rendus via `qlmanage`/`sips` (outils macOS natifs).

### SEO

- Balises canoniques + `hreflang` (en, fr, x-default) sur les 4 pages.
- JSON-LD `@graph` : `Person` (id stable `#person`), `WebSite`, `ProfilePage`
  (+ `BreadcrumbList` sur les CV).
- OpenGraph + Twitter Cards avec image dédiée 1200×630.
- `sitemap.xml` avec alternates `xhtml:link` par langue ; `robots.txt` excluant
  `/v2022/` et `/infos/` (archives et sources non destinées à l'index).
- `404.html` personnalisée (GitHub Pages la sert automatiquement).
- Contraste AA : l'accent terracotta est décliné en `--accent-ink` plus foncé
  (`#9A4A26`) pour tout texte, le `#D97757` restant décoratif.
- Performance : polices préchargées, `font-display: swap`, aucun script bloquant.

### Contenu

- Source unique : [infos/INFOS.md](infos/INFOS.md) (rédigé par Nicolas, priorités par
  section respectées).
- CV disponible en **deux langues** (`/cv/` EN, `/fr/cv/` FR), mise en page écran
  « document » + feuille de style d'impression A4 pour export PDF.

### TODO (actions côté Nicolas)

- [ ] DNS : pointer `nicolaspieper.com` vers GitHub Pages (A/AAAA apex + CNAME www).
- [ ] DNS : rediriger en 301 `nicolas.pieper.fr` → `https://nicolaspieper.com`.
- [ ] Activer « Enforce HTTPS » dans les settings GitHub Pages après propagation.
- [ ] Déclarer le site dans Google Search Console + soumettre `sitemap.xml`.
- [ ] Mettre à jour l'URL du site sur le profil LinkedIn.
- [ ] (Optionnel) Fournir une photo récente pour remplacer le monogramme.
- [ ] Confirmer la section « Langues » des CV (Français natif / Anglais professionnel) -
      non présente dans INFOS.md ; ajouter allemand/luxembourgeois le cas échéant.

---

## 2026-07-14 - Ajout des archives

- Import de la version 2022 du site dans [`/v2022/`](v2022/) pour l'historique.
- Ajout de [infos/INFOS.md](infos/INFOS.md), source de contenu de la refonte.

## 2024 - Version « pizza »

Site one-page au thème pizzeria napolitaine (Anton / Permanent Marker / Space Mono,
marquee, stickers). Remplacée par la v2026 ; le code reste dans l'historique git
(`git log -- style.css script.js`).

## 2022 - Version Bootstrap

Carte de visite one-page (Bootstrap 5, avatar, liens). Archivée dans [`/v2022/`](v2022/).
