# Documentation du domaine

Ce dépôt utilise le mode `single-context`.

## Avant d'explorer

- Lire `CONTEXT.md` à la racine s'il existe.
- Lire dans `docs/adr/` chaque ADR qui touche la zone étudiée, si ce dossier existe.

Si ces sources n'existent pas, poursuivre silencieusement. Ne pas proposer de les créer d'avance. Le skill `/domain-modeling` les crée lorsqu'un terme ou une décision doit être fixé.

## Structure

```text
/
|-- CONTEXT.md
|-- docs/
|   `-- adr/
|       |-- 0001-exemple-de-decision.md
|       `-- 0002-autre-decision.md
`-- assets/
```

## Utiliser le vocabulaire du glossaire

Quand une sortie nomme un concept du domaine, reprendre le terme défini dans `CONTEXT.md`. Éviter les synonymes que le glossaire écarte.

Un concept absent peut signaler un mot inventé ou un vrai manque. Reconsidérer le terme, puis noter le manque pour `/domain-modeling` si le concept est nécessaire.

## Signaler les conflits avec une ADR

Si une proposition contredit une ADR existante, le signaler explicitement et citer cette ADR. Ne jamais la remplacer silencieusement.
