# nicolaspieper.com

Site personnel de Nicolas Pieper - présenté comme sa **documentation** : sobre,
ivoire/encre, un seul accent (International Orange `#FF4F00`), bilingue FR/EN,
CV HTML avec PDF téléchargeables. Statique, sans framework ni dépendance runtime.

**Production :** [nicolaspieper.com](https://nicolaspieper.com) (canonique) ·
`nicolas.pieper.fr` (redirection 301)
**Hébergement :** GitHub Pages · **Stack :** HTML / CSS / JS statique, zéro framework, zéro CDN.

> L'historique détaillé des interventions est dans [`CHANGELOG.md`](CHANGELOG.md).
> Les règles pour les interventions automatisées sont dans [`AGENTS.md`](AGENTS.md).

## Comment déployer sur Atlas

Pour une modification normale du site, il ne faut modifier ni le code ni le contrat de
`vps-infra` :

1. créer une branche dans ce dépôt, faire la modification et ouvrir une pull request vers
   `main` ;
2. attendre le check `Validate VPS release`, puis fusionner la pull request ;
3. vérifier que le workflow
   [`VPS release`](https://github.com/nclsppr/personal/actions/workflows/vps-release.yml) du
   nouveau commit `main` est vert ;
4. attendre le prochain passage du workflow central, planifié toutes les dix minutes en
   best-effort : GitHub Actions peut retarder son exécution. Atlas active le nouveau digest
   seulement si le HEAD, les checks, les attestations et les probes restent valides.

Pour relancer la réconciliation immédiatement après la publication verte, sans changer de
fichier ni fournir de SHA ou de digest :

```sh
gh workflow run deploy-static-releases.yml \
  --repo nclsppr/vps-infra \
  --ref main
```

Ce dispatch examine Personal, Papers Empire et la démo statique Parkventory. Les tuples déjà
actifs deviennent des no-op. Une modification de `vps-infra` est nécessaire uniquement pour
changer la politique de déploiement, les checks requis, l'intégration Caddy ou l'activation
d'un profil, jamais pour publier un contenu normal. Le diagnostic détaillé est dans le
[runbook central](https://github.com/nclsppr/vps-infra/blob/main/docs/operations/static-release-reconciliation.md).

## Aperçu

- **Bilingue par URLs distinctes** (`/` EN, `/fr/` FR) avec `hreflang` réciproques - pages
  pré-rendues pour le SEO, pas de traduction JavaScript côté client.
- **Thème clair/sombre** : bascule manuelle persistée en `localStorage`, défaut aligné sur
  `prefers-color-scheme`, script inline anti-flash dans le `<head>`.
- **Navigation « documentation »** : sidebar par groupes, scrollspy, ancres sur les titres,
  breadcrumb.
- **Accessibilité** : navigation clavier, focus visible, contrastes AA, cibles tactiles
  ≥44 px, tiroir mobile modal, ARIA mis à jour dynamiquement (thème, scrollspy).
- **Zéro dépendance runtime** : un script partagé pour le thème, le tiroir mobile, le
  scrollspy, les redirections d’ancres et le deep-link de langue. `/claude/` garde un
  script autonome pour ses interactions. Polices woff2 auto-hébergées.

## Architecture

| URL | Fichier | Contenu |
| --- | --- | --- |
| `/` | `index.html` | Homepage anglaise (langue par défaut) |
| `/fr/` | `fr/index.html` | Homepage française |
| `/work/` | `work/index.html` | Études de cas et leadership en anglais |
| `/fr/work/` | `fr/work/index.html` | Études de cas et leadership en français |
| `/cv/` | `cv/index.html` | CV anglais avec PDF pré-généré téléchargeable |
| `/fr/cv/` | `fr/cv/index.html` | CV français avec PDF pré-généré téléchargeable |
| `/blog/` | `blog/index.html` | Index des articles en anglais |
| `/fr/blog/` | `fr/blog/index.html` | Index des articles en français |
| `/blog/<article>/` | `blog/*/index.html` | Cinq articles en anglais |
| `/fr/blog/<article>/` | `fr/blog/*/index.html` | Cinq articles en français |
| `/dashboard/` | `dashboard/index.html` | Morning brief expérimental, données d’exemple, non indexé |
| `/claude/` | `claude/index.html` | Easter egg public, indexé et hors navigation principale |
| `/claude/roadtrip-austria-2026/` | `claude/roadtrip-austria-2026/index.html` | Carnet de route interactif et local pour le voyage en Autriche |
| `/llms.txt` | `llms.txt` | Index éditorial concis pour les agents et outils d'IA |
| `/400.html` à `/504.html` | `4xx.html`, `5xx.html` | Dix pages d’erreur bilingues |
| `/v2022/` | `v2022/` | Archive de la version 2022 (non indexée) |
| `/infos/` | `infos/INFOS.md` | Source de contenu (non indexée) |

```
assets/
  css/   site.css · cv.css · dashboard.css
  js/    site.js            (thème · sidebar · scrollspy · deep-link langue)
  fonts/ woff2 variables (Inter · Source Serif 4 · JetBrains Mono, subsets latin/-ext)
  img/   logo, favicons, portraits, image OpenGraph
  docs/  CV PDF pré-générés en anglais et en français
claude/
  style.css · script.js     (socle autonome)
  roadtrip-austria-2026/    (itinéraire, checklist locale et illustrations)
  postcard.css              (carte postale et tampon local)
  capsule.css · capsule.js  (capsule conservée dans le navigateur)
  window.css · window.js    (fenêtre accordée à l'heure locale)
```

## Lancement local

Aucun build : ce sont des fichiers statiques. Un serveur local suffit (chemins absolus
`/assets/...`, donc servir depuis la racine du repo) :

```sh
python3 -m http.server 4173 --directory .
# → http://localhost:4173
```

La config `.claude/launch.json` (`personal-site`) fait la même chose pour l'aperçu intégré.

## Build et PDF

Aucune étape de build pour le déploiement. Ce qui est dans le repo est servi tel quel.
Après une modification des CV HTML, régénérer les deux PDF depuis le serveur local :

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$PWD/assets/docs/nicolas-pieper-cv-en.pdf" \
  http://127.0.0.1:4173/cv/

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$PWD/assets/docs/nicolas-pieper-cv-fr.pdf" \
  http://127.0.0.1:4173/fr/cv/
```

Assets images/favicons régénérés à la main via les outils macOS natifs (`sips`, `qlmanage`) ;
voir le `CHANGELOG.md` pour les commandes utilisées.

## Validation

Avant chaque commit touchant le site, la **parité FR/EN** doit être vérifiée : `/` et `/fr/`
gardent la même structure, les mêmes sections/ancres, et chaque texte est la traduction
équivalente (aucun texte source oublié, aucun placeholder).

Un hook `git commit` (`~/Developer/.claude/hooks/check-i18n-parity.py`) bloque le commit si
la parité *structurelle* diverge. La parité *sémantique* reste vérifiée par relecture.

Tester systématiquement : **mobile + desktop**, **clair + sombre**, et l'**impression** du CV.

## Déploiement

Push sur `main` → GitHub Pages sert le repo tel quel. Le domaine custom est fixé par `CNAME`.

Le workflow `VPS release` construit en parallèle une archive publique par allowlist et un
inventaire complet des routes. Il publie les deux objets dans GHCR avec un digest immuable,
atteste leur provenance GitHub et conserve une preuve de publication pendant 30 jours. Le
dépôt ne possède aucun secret Atlas et ce workflow ne contacte pas le VPS.

L'activation est ensuite prise en charge par le réconciliateur central de
[`nclsppr/vps-infra`](https://github.com/nclsppr/vps-infra). Son workflow est planifié toutes
les dix minutes en best-effort : GitHub Actions peut retarder son exécution. À chaque passage,
il résout le HEAD exact de `main`, exige les checks configurés au vert, transforme les tags
`sha-<commit>` en digests, puis demande à Atlas de vérifier à nouveau les attestations et le
contrat HTTP avant un basculement transactionnel. Une publication seule ne suffit donc pas à
activer une version, et un ancien commit vert n'est pas utilisé comme repli.

Preuve historique observée le 18 août 2026, avant cette consolidation documentaire : le commit
`328b535b934560fcaf6324383440a3c2a60641c4`, publié par le run Actions
[`32008106067`](https://github.com/nclsppr/personal/actions/runs/32008106067), était actif sur
Atlas avec le site
`sha256:61b478b86fd01cc73b1a080fd2a581256032bbb109ee2a47ef155a1dc09d747e` et les routes
`sha256:7109f8e15853b15948eaef0c920e5e0f1265d6d74710278b456b4600163f58be`. Le run central
[`32078379931`](https://github.com/nclsppr/vps-infra/actions/runs/32078379931) a ensuite
confirmé le job Personal sur Atlas. Le commit qui ajoute cette note produit lui-même un
nouveau candidat. L'état courant se vérifie dans le workflow central et sur Atlas, jamais en
déduisant qu'un digest historique reste actif.

## Principes de conception

- **Statique et sobre** : pas de framework, pas de CDN, pas de tracker. Le contenu reste
  lisible sans JavaScript.
- **Un seul accent** : International Orange `#FF4F00` réservé aux petites zones à fort impact ;
  le texte utilise une déclinaison plus sombre pour rester lisible (AA).
- **Esthétique « documentation »** : ivoire/encre, serif pour les titres, monospace pour les
  touches techniques. Pas d'animation gratuite ; `prefers-reduced-motion` respecté.
- **Vérité du contenu** : aucune métrique, responsabilité ou technologie inventée ; toute
  ambiguïté est signalée plutôt que tranchée arbitrairement.
- **Sources canoniques** : les pages HTML publiques restent la référence indexable. Le
  fichier `llms.txt` les signale aux agents sans dupliquer les contenus ni exposer les
  documents internes du dépôt comme sources de profil.
