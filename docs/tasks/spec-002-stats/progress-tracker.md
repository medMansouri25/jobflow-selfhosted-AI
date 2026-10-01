# Task: Statistiques du tableau de bord (T2.4)

**Status**: Completed
**Type**: Full-stack
**Created**: 2026-10-01

## Problem
Le tableau de bord ne dit pas si la recherche avance : ni réponses, ni entretiens obtenus, ni rythme d'envoi (SPEC-002, FR-002-04 à 06).

## Outcome
Deux indicateurs de plus (Taux de réponse, Taux d'entretien) et un graphique « Candidatures par semaine » sur 8 semaines.

## Constraints / Notes
- Décisions du 2026-10-01 : ces 3 statistiques seulement ; semaines du lundi, heure de Paris, d'après la date de candidature ; taux arrondis, « — » sans Candidature ; un refus après entretien compte comme entretien (historique).
- Calculs purs dans `src/modules/dashboard/domain/stats.ts` (jours AAAA-MM-JJ, arithmétique en UTC) ; lecture en base dans `getApplicationStats` (module applications, comme `countApplicationsByStatus`).
- Vérifié dans le navigateur avec 6 Candidatures de démonstration en `jobflow_dev` : 50 % / 33 %, barres aux bonnes semaines.
- Constat hors périmètre : l'application entière n'est pas adaptée au téléphone (la barre latérale prend la moitié de l'écran) ; à traiter dans une tâche dédiée.

## Missions
- [x] Mission 1: Domaine — `rate`, `weeklyCounts`, `oldestWeekShown` + tests (AC-002-01, 02, 04, 05)
- [x] Mission 2: Backend — `getApplicationStats(userId, appliedSince)` + tests d'intégration (AC-002-02, 03, 05, 06)
- [x] Mission 3: Frontend — indicateurs et graphique hebdomadaire, page d'accueil branchée + tests de composant (AC-002-01, 02, 05)
