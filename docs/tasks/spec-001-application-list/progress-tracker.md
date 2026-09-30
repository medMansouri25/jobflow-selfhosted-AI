# Task: Liste, recherche, filtres, tri (T1.9)

**Status**: In dev
**Type**: Full-stack
**Created**: 2026-09-30

## Problem
La liste `/applications` affiche tout, sans recherche, filtre, tri ni pagination : on ne retrouve pas une Candidature parmi des dizaines.

## Outcome
La liste se cherche (Entreprise, poste, localisation), se filtre (statuts cochés, contrat, source), se trie (dernière modification, date de candidature, Entreprise A → Z) et se pagine par 25 ; tout vit dans l'adresse de la page (FR-001-08 à 12, AC-001-14, 15, 16, 21).

## Constraints / Notes
- Barre au-dessus de la liste (maquette, sans « Afficher » devenu inutile) : champ « Rechercher entreprise ou poste… » ; **Statut** en cases à cocher (plusieurs possibles) ; **Contrat** et **Source** en listes « Tous » par défaut ; **Trier par** : Dernière modification (défaut, décroissant), Date de candidature, Entreprise (A → Z) ; bouton **« Filtrer »** (formulaire GET, fonctionne sans JavaScript) et **« Réinitialiser »**.
- Paramètres d'URL : `q`, `statut` (répétable), `contrat`, `source`, `tri` (`modifiee` | `candidature` | `entreprise`), `page`. La recherche de la barre du haut (`GET /applications?q=`) arrive directement filtrée. Une valeur inconnue dans l'URL est ignorée (pas d'erreur).
- Pagination **25 par page** : **H5 confirmée** le 2026-09-30. « Page N sur M · X candidatures », « Précédent » / « Suivant » (désactivés aux extrémités), liens qui gardent les filtres ; changer un filtre revient page 1 ; page hors limites → dernière page existante ; sous 25 résultats, pas de pagination.
- Recherche partielle, insensible à la casse, sur Entreprise + poste + localisation (pas description ni notes) ; `%`, `_`, `'` traités comme du texte ; accents non normalisés.
- Aucun résultat avec des filtres : « Aucune candidature ne correspond. » + « Réinitialiser les filtres » ; « Aucune candidature pour l'instant » reste pour une liste vraiment vide.
- Le tableau de bord garde ses 5 Candidatures récentes : son appel passe par une fonction dédiée `listRecentApplications(userId, limit)` (comportement inchangé), puisque `listApplications` change de forme.
- Noms de code anglais (CONTEXT.md : Candidature = `Application`) : résultat `{ applications, total, page, pages }`, entrée `ListApplicationsInput = z.infer<typeof listApplicationsSchema>` ; seuls les paramètres d'URL et l'interface sont en français. L'ancien `TODO(T1.9)` « actives par défaut » est supprimé (ADR 0005).
- Toujours filtré par `userId` ; lignes cliquables (`RowLink`) conservées.
- Branche `feature/spec-001-application-list`, une PR, revue complète avant fusion ; jamais de mention de Claude.

## Missions
- [ ] Mission 1: Backend — `listApplicationsSchema` (paramètres d'URL tolérants) et `listApplications(userId, filtres)` → { applications, total, page, pages }, `listRecentApplications` pour le tableau de bord : recherche, statuts, contrat, source, tri, pagination par 25 bornée (AC-001-14, 15, 16, 21, caractères spéciaux) — tests unitaires et d'intégration
- [ ] Mission 2: Frontend — page `/applications` : barre de filtres (formulaire GET), résultats, pagination, état « Aucune candidature ne correspond » ; tableau de bord inchangé
- [ ] Mission 3: Docs — SPEC-001 (H5 confirmée, §8 liste, FR-001-10 statuts cochés), `TASKS.md` (T1.9), patterns si besoin

## Mission Summaries
_Filled in as each mission completes. Future missions read these for context._
