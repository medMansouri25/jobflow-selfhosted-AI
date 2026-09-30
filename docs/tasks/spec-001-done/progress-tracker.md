# Task: Clôture de SPEC-001 (T1.10)

**Status**: Completed
**Type**: Docs
**Created**: 2026-09-30

## Problem
Toutes les fonctions de SPEC-001 sont livrées (T1.1 à T1.9, pièces jointes PDF), mais les specs sont encore « Draft » et rien ne récapitule quel test couvre quel critère d'acceptation.

## Outcome
SPEC-001 passe « Implémentée » avec la correspondance critère → test ; SPEC-000 (cycle de vie corrigé : trois statuts) passe « Validée » ; T0.1 et T1.10 cochées.

## Constraints / Notes
- 19 critères couverts par un test qui cite leur identifiant ; AC-001-09 retiré (ADR 0005) ; AC-001-10 testé mais sans identifiant cité → renommer les tests concernés (règle de SPEC-001 §12 : chaque test cite son critère).
- SPEC-000 §4 montre encore Brouillon / Acceptée / Classée / réouverture → schéma à trois statuts (ADR 0005).
- Toutes les hypothèses de SPEC-001 sont tranchées (H1, H4 par la maquette ; H2, H3, H5 confirmées) : la note d'en-tête sur les « ⚑ Hypothèse » devient historique.
- Branche `docs/spec-001-done`, une PR, revue complète avant fusion ; jamais de mention de Claude.

## Missions
- [x] Mission 1: Tests — AC-001-10 cité dans les tests qui le couvrent (date du jour par défaut, pré-rendu)
- [x] Mission 2: Docs — SPEC-001 « Implémentée » + tableau critère → test ; SPEC-000 cycle de vie à trois statuts, « Validée » ; `TASKS.md` (T0.1, T1.10)

## Mission Summaries
_Filled in as each mission completes. Future missions read these for context._

### Mission 1: AC-001-10 cité
**Status**: Completed
- **Files**: `components/application-form.test.tsx`, `service.integration.test.ts`
- **Built**: trois tests existants renommés pour citer AC-001-10 (date du jour proposée, pas figée au build, enregistrée telle quelle) ; aucun changement de comportement.

### Mission 2: Specs et TASKS
**Status**: Completed
- **Files**: `specs/001-application-management.md` (statut « Implémentée », note d'hypothèses historique, tableau critère → test en fin de §9), `specs/000-product-vision.md` (statut « Validée », cycle de vie à trois statuts), `TASKS.md` (T0.1 et T1.10 cochées)
