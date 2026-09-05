# Ajouter ou mettre à jour un objet

## Source unique

`data/objects.json` est le catalogue. `scripts/generate-objects.py` produit
`objects/index.html` et `fr/objects/index.html`. Ne pas éditer ces pages à la main.
Les fragments de navigation sont dans `scripts/templates/objects-en.html` et
`objects-fr.html` ; ils doivent suivre la navigation globale.

## Les faits viennent de Nicolas

- `status: owned` signifie que Nicolas a explicitement dit posséder cet objet.
  `wishlist` signifie qu’il a explicitement exprimé cette envie.
- Ne pas déplacer un objet entre les deux états sans sa confirmation.
- Conserver la marque, la génération et le nom exacts. Faire préciser les
  variantes inconnues, sans inventer une couleur, une taille, un bracelet,
  un piètement, une disposition de clavier ou une capacité.
- Une envie peut concerner un produit non annoncé. L’indiquer clairement dans les
  deux langues, dater la vérification et ne pas créer une photo ou un faux ASIN.
- Ne pas inventer les raisons pour lesquelles Nicolas aime l’objet, des essais,
  une durée d’usage, des performances, des notes ou des recommandations.
- `variant`, `note`, les libellés des liens et les textes alternatifs doivent
  être complets et équivalents en français et en anglais.

## Chaque fiche propose une suite sur Amazon.fr

L’identifiant est **`nclsppr-21`**, exclusivement pour cette collection.

1. Chercher une fiche Amazon.fr du produit exact. Vérifier le titre, la marque,
   la génération, la variante et le contenu vendu : un accessoire n’est pas
   l’objet. Enregistrer l’ASIN, l’URL de preuve et la date de vérification.
2. Un lien direct utilise `https://www.amazon.fr/dp/ASIN?tag=nclsppr-21`.
   `kind: exact` exige une référence vérifiée. Une capacité ou une configuration
   différente doit être explicitée, sans dire qu’il s’agit de celle de Nicolas.
3. Quand le produit exact n’est pas vérifié, proposer au moins deux pistes
   nommées, adaptées à l’usage ou au type d’objet. Elles restent des alternatives,
   jamais des objets que Nicolas possède ou a testés.
4. Un lien de recherche est autorisé comme piste explicite, avec `kind: search` :
   `https://www.amazon.fr/s?k=REQUETE_ENCODEE&tag=nclsppr-21`. L’afficher comme
   « Rechercher » ou « Explorer », jamais comme un achat exact vérifié.
5. Ne pas inventer d’ASIN, de prix, de disponibilité, de livraison, de réduction,
   de classement, d’équivalence de performance ou de preuve de vente officielle.
   Si une marque ne vend pas sur Amazon UE, garder son lien fabricant et proposer
   des alternatives distinctes. C’est notamment le cas déclaré par Devialet.
6. Tous les liens commerciaux conservent `rel="sponsored external noopener"`,
   `data-affiliate="amazon"`, le bon tag et l’annonce du nouvel onglet. Le
   générateur affiche une mention proche des liens et la déclaration Amazon
   complète dans la page. Ne pas les masquer.

Aucun pixel, script Amazon, cookie publicitaire ou requête Amazon n’est chargé
avant le clic. Le site ne réalise aucune transaction.

## Photographies et provenance

Préférer un vrai packshot officiel sur fond blanc ou transparent. Vérifier
visuellement le modèle : les galeries de marque peuvent mélanger générations,
variantes, accessoires et photos de groupe. Une URL qui répond 200 ne suffit pas.

Pour chaque image, enregistrer `source` (fichier distant), `sourcePage`, `credit`,
`checkedAt`, `match`, dimensions et SHA-256. Une photo de variante illustrative
porte une légende précise. Ne jamais la présenter comme une photo personnelle.
Aucune photo d’iPhone non annoncé, aucun recoloriage ou assemblage qui fabriquerait
une variante inexistante.

Le registre conserve l’état réel des droits. Les photographies restent la
propriété de leurs sources ; l’accès à un fichier ou sa citation ne constitue
pas une licence. La collecte initiale ne documente aucun accord séparé de
réutilisation. Ne pas transformer cet état en « autorisé » sans preuve du titulaire.
Pour les ajouts, rechercher et enregistrer les conditions de réutilisation ou
l’autorisation applicable, ainsi que ses limites ; signaler une absence de preuve.

Ne pas aspirer ni committer les images Amazon : les règles de leur programme
s’appliquent aux contenus publicitaires fournis par leurs mécanismes officiels.
Le catalogue utilise des photographies de fabricants, pas des images Amazon.
Optimiser les fichiers locaux en WebP en conservant couleurs, proportions et sujet.

Sources du programme à revérifier lors d’un changement commercial :

- [Accord Amazon Partenaires](https://partenaires.amazon.fr/help/operating/agreement)
- [Politiques Amazon Partenaires](https://partenaires.amazon.fr/help/operating/policies)
- [Liens texte manuels](https://partenaires.amazon.fr/help/node/topic/GP38PJ6EUR6PFBEC)
- [Déclaration de Devialet sur Amazon UE](https://www.devialet.com/fr-ca/legal/anti-counterfeit/)

## Générer, vérifier, publier

```sh
python3 scripts/generate-objects.py
python3 scripts/generate-objects.py --check
python3 scripts/validate-site.py
node --check assets/js/objects.js
git diff --check
```

Relire la parité sémantique, le statut et les liens. Vérifier dans le navigateur :
mobile et desktop, clair et sombre, filtres, ouverture de chaque fiche, fermeture
par le bouton et Échap, retour arrière, lien direct avec ancre, retour du focus,
absence de débordement, images chargées et détails utilisables sans JavaScript.

Si la composition de partage change, modifier `scripts/objects-og-template.html`,
exécuter `./scripts/generate-objects-og-image.sh`, vérifier les deux PNG 1200x630
et incrémenter `?v=N` dans le générateur. Mettre à jour le changelog. Suivre la
publication du README : PR, check requis, fusion dans main, GitHub Pages sur le
SHA exact, puis preuves HTTP sur les deux routes et les fichiers publiés.
