# Task: Fiche de préparation d'entretien (T9.2, SPEC-009 A)

**Status**: Completed
**Type**: Full-stack + service externe
**Created**: 2026-10-01

## Problem
Avant un entretien, je ne sais pas quelles questions m'attendent selon son type, ni comment y répondre avec mon parcours (SPEC-009).

## Outcome
Sous chaque Entretien de la fiche : « Préparer avec l'IA » / « Refaire la fiche » ; la fiche (questions probables avec pistes tirées du Profil, points à mettre en avant, questions à poser) est enregistrée avec l'Entretien, à côté de la Préparation de l'utilisateur.

## Constraints / Notes
- Décisions du 2026-10-01 : fiche (A) et entraînement (B) ; ici A.
- Réutilise `assistant-inputs` / `assistant-data` (préalables, minimisation, délimitation) ; `parseAssistantJson` commun à l'analyse et à la fiche ; `findOwnedInterview` exporté.
- Colonne `Interview.aiPreparation` (JSONB), relue avec `interviewPrepSchema`.
- Vérifié de bout en bout le 2026-10-01 (dev, profil fictif, entretien technique de démonstration chez Thales) : questions adaptées au type, pistes tirées du profil, trous signalés (« rien dans ton profil sur… »).

## Missions
- [x] Mission 1: `parseAssistantJson` commun ; demande et lecture de la fiche + tests (AC-009-02, 04)
- [x] Mission 2: Colonne `aiPreparation` + migration ; `prepareInterview` / `readInterviewPrep` + tests d'intégration (AC-009-01, 03, 04, 08)
- [x] Mission 3: Action, `InterviewPrepPanel` sous chaque Entretien (`assistantFor`) + tests de composant (AC-009-01) ; essai réel

## Review (2026-10-01)
- Corrigé : formulaire de chaque fiche nommé par son Entretien (« Préparer : Entretien Technique du … ») au lieu d'un nom identique répété ; libellé construit une fois (`interviewLabel`) sur la page.
- Corrigé : `readStoredJson` commun relit l'analyse et la fiche enregistrées.
