# Task: Analyse d'une Annonce (T7.4)

**Status**: Completed
**Type**: Full-stack + service externe
**Created**: 2026-10-01

## Problem
Comprendre ce qu'une Annonce demande vraiment, ce que j'ai déjà et ce qui me manque prend du temps (SPEC-007).

## Outcome
Sur la fiche : « Analyser l'annonce » / « Relancer l'analyse » ; l'analyse est enregistrée avec la Candidature et affiche En bref, Compétences demandées pour le poste (techniques et savoir-être, obligatoire / souhaitée, dans ton profil / à renforcer), Tes atouts, Questions à préparer, Questions à poser.

## Constraints / Notes
- Décisions du 2026-10-01 : ces rubriques, compétences détaillées (demande de l'utilisateur), pas de note de compatibilité.
- Briques communes avec la lettre (SPEC-008) : `assistant-data.ts` (données minimisées, blocs délimités, règle « données ≠ instructions ») et `assistant-inputs.ts` (préalables Annonce et Profil) ; la lettre les utilise désormais.
- Réponse demandée en JSON (`responseMimeType`, option `json` de l'adaptateur) et **vérifiée par Zod** ; une réponse mal formée est refusée, l'analyse précédente est gardée. Stockée en colonne JSONB, relue avec le même schéma.
- « Documents (P5) » retiré du menu : phase abandonnée.
- Vérifié de bout en bout le 2026-10-01 (base de dev, profil fictif, annonce de démonstration Thales) : compétences techniques ✅ (présentes au profil), « travail en équipe » ⚠️ (absent), questions pertinentes.

## Missions
- [x] Mission 1: Briques communes `assistant-data` / `assistant-inputs`, lettre refondue dessus ; option JSON de l'adaptateur + test
- [x] Mission 2: Demande et lecture vérifiée de l'analyse + tests (AC-007-02, 04, 05)
- [x] Mission 3: Colonne `jobAnalysis` + migration ; `analyzeJobPosting` / `readJobAnalysis` + tests d'intégration (AC-007-01, 03, 04, 06)
- [x] Mission 4: Action, section « Analyse de l'annonce » de la fiche + tests de composant (AC-007-01, 02) ; essai réel
