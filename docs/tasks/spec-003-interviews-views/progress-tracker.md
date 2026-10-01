# Task: Prochains entretiens et page « Entretiens » (T3.5, T3.6)

**Status**: Completed
**Type**: Full-stack
**Created**: 2026-10-01

## Problem
Les Entretiens ne se voient que sur la fiche de leur Candidature : rien ne rappelle les prochains, et on ne peut pas les parcourir tous (FR-003-06, 07).

## Outcome
Tableau de bord : panneau « Prochains entretiens » (5 prochains, lien vers la Candidature) et nombre d'entretiens à venir dans l'en-tête. Menu : « Entretiens » actif, page avec les à venir (plus proche d'abord) puis les passés (plus récent d'abord).

## Constraints / Notes
- Requêtes dans `interview-lists.ts` (module Candidatures) ; « à venir » = après maintenant (BR-003-07), l'instant est passé en paramètre (testable).
- `InterviewList` partagé entre le tableau de bord et la page.
- Vérifié dans le navigateur (base de dev) : tableau de bord « 1 entretien à venir » + panneau, page Entretiens (1 à venir, 0 passé), menu actif.

## Missions
- [x] Mission 1: `listUpcomingInterviews`, `listInterviews`, `countUpcomingInterviews` + tests d'intégration (AC-003-07, 08)
- [x] Mission 2: `InterviewList`, panneau du tableau de bord, page `/interviews`, menu + tests de composant (AC-003-07, FR-003-07)
