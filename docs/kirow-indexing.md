# Kirow : publication et demandes d'indexation

Les pages publiques sont `https://nicolaspieper.com/kirow/` en français et
`https://nicolaspieper.com/kirow/en/` en anglais. Une page accessible, présente
dans le sitemap et autorisant les robots peut être explorée. Cela ne prouve
ni son indexation, ni son classement, ni l'affichage immédiat de sa miniature
dans chaque application de partage.

## Avant toute demande

1. Exécuter `python3 scripts/validate-site.py` et valider les deux langues.
2. Publier par une PR vers `main`, après réussite du contrôle `Validate site`.
3. Attendre la publication GitHub Pages du SHA fusionné et vérifier les deux
   pages, le sitemap et les images sur le domaine canonique.

## Bing et les moteurs participant à IndexNow

`indexnow-key.txt`, servi à la racine du site, est le fichier public de
vérification du protocole. Ce n'est pas un identifiant de compte ni une clé
d'accès à Bing Webmaster Tools. Le script utilise uniquement le domaine
canonique et l'endpoint officiel `https://api.indexnow.org/indexnow`.

Depuis la racine du dépôt, après publication :

```sh
python3 scripts/submit-kirow-indexnow.py
python3 scripts/submit-kirow-indexnow.py --submit
```

La première commande ne soumet rien. Le script vérifie le fichier de
vérification public, l'identité exacte des deux HTML avec le dépôt, leurs
canonicals et l'absence de consigne restrictive dans leurs métadonnées ou
en-têtes. Il refuse les redirections. La seconde commande transmet uniquement
les deux URL Kirow après les mêmes contrôles.

Un HTTP 200 confirme la réception des URL. Un HTTP 202 signifie que leur
réception précède encore la validation de la clé. Aucun des deux statuts ne
prouve une indexation. Vérifier ensuite la réception et l'état des URL dans
Bing Webmaster Tools. Ne pas soumettre en boucle : une nouvelle soumission
n'accélère pas nécessairement le traitement.

Références : [protocole IndexNow](https://www.indexnow.org/documentation) et
[guide officiel Bing](https://www.bing.com/indexnow/getstarted).

## Google Search Console

Dans le compte disposant déjà des droits sur la propriété du domaine :

1. Ouvrir [Google Search Console](https://search.google.com/search-console/)
   et sélectionner la propriété correspondant à `nicolaspieper.com`.
2. Inspecter `https://nicolaspieper.com/kirow/` avec la barre d'inspection d'URL.
3. Tester l'URL publiée, vérifier qu'elle autorise l'indexation, puis choisir
   « Demander une indexation ».
4. Répéter pour `https://nicolaspieper.com/kirow/en/`.
5. Dans « Sitemaps », vérifier la présence et la bonne lecture de
   `https://nicolaspieper.com/sitemap.xml` ; le soumettre s'il n'est pas déclaré.

Cette opération requiert un propriétaire ou un utilisateur complet de la
propriété. Le dépôt et la publication du sitemap ne prouvent pas qu'une demande
a été envoyée depuis ce compte. Si la propriété n'est pas accessible, signaler
ce point sans prétendre que la demande a été faite.

Google peut prendre plusieurs jours ou semaines pour explorer une page et
ne garantit pas son indexation. L'API Google Indexing est réservée aux annonces
d'emploi et à certaines pages de diffusion vidéo : elle ne convient pas à Kirow.
IndexNow ne remplace pas cette procédure Google.

Références : [demander une nouvelle exploration](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl),
[inspection d'URL](https://support.google.com/webmasters/answer/9012289?hl=fr)
et [périmètre de l'API Indexing](https://developers.google.com/search/apis/indexing-api/v3/quickstart).
