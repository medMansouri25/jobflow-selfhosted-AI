# Task: Machine à états des statuts (T1.2)

**Status**: In dev
**Type**: Backend (domaine pur)
**Created**: 2026-09-27

## Problem
Rien ne dit quelles transitions de statut sont permises : T1.4 (fin), T1.7 (changer le statut) et T1.9 (filtre actives / terminées) n'ont pas de règle commune sur laquelle s'appuyer.

## Outcome
`src/modules/applications/domain/status.ts` porte la table BR-001-05 et répond, sans dépendance, à : cette transition est-elle permise, quelles transitions depuis ce statut, la Candidature est-elle active, ce statut est-il définitif. AC-001-05 à 09 sont couverts par des tests unitaires.

## Constraints / Notes
- TypeScript pur (ni Next.js, ni Prisma, ni `lib/errors`) ; les statuts restent importés depuis `domain/application.ts`.
- La table BR-001-05 est écrite une seule fois (`STATUS_TRANSITIONS`) ; `canTransition`, `allowedTransitions` et `isDefinitive` en sont déduits. `ACTIVE_STATUSES` / `isActive` suivent la définition de **Candidature active**.
- Vocabulaire : **Candidature terminée** (Acceptée, Refusée, Classée) et **Statut définitif** (Acceptée, Refusée) — jamais « terminal » (CONTEXT.md, 2026-09-27).
- Même statut → refusé. Les champs requis pour Postulée (BR-001-02) ne relèvent pas de la machine (T1.3 / T1.7).
- Hors périmètre : `DomainError` de transition interdite, vérification sur le statut en base, historique, UI (tout dans T1.7).
- Tests : la table attendue est réécrite à la main depuis la spec, les 36 paires sont vérifiées ; chaque test cite son AC (`it("AC-001-06 refuse DRAFT → ACCEPTED", …)`).
- Branche `feature/spec-001-status-machine`, une PR ; jamais de mention de Claude.

## Missions
- [x] Mission 1: Backend — `domain/status.ts` : `STATUS_TRANSITIONS` (BR-001-05), `canTransition`, `allowedTransitions`, `ACTIVE_STATUSES`, `isActive`, `isDefinitive`, avec tests unitaires des 36 paires et d'AC-001-05 à 09

## Mission Summaries
_Filled in as each mission completes. Future missions read these for context._

### Mission 1: Machine à états des statuts
**Status**: Completed
- **Files**: `src/modules/applications/domain/status.ts`, `status.test.ts`
- **Built**: `STATUS_TRANSITIONS` (table BR-001-05), `canTransition(from, to)`, `allowedTransitions(from)` (ordre de la table, pour le menu), `ACTIVE_STATUSES`, `isActive(status)`, `isDefinitive(status)` (déduit : aucune transition sortante).
- **Tests**: `status.test.ts` (Vitest, projet unit) — AC-001-05 à 09 nommés, les 36 paires contre une table recopiée à la main depuis la spec, active / définitif pour les 6 statuts.
- **Integrates with**: T1.7 appelle `canTransition` sur le statut **en base** et lève sa propre `DomainError` ; son menu affiche `allowedTransitions` et demande confirmation quand la cible `isDefinitive`. T1.9 filtre avec `ACTIVE_STATUSES`.
