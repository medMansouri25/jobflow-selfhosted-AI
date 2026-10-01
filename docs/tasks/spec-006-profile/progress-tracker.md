# Task: Page Profil (T6.2)

**Status**: Completed
**Type**: Full-stack
**Created**: 2026-10-01

## Problem
L'assistant qui écrira des lettres de motivation personnalisées (SPEC-008) ne sait rien de l'utilisateur (SPEC-006).

## Outcome
Page « Profil » (menu) : 6 champs courts (nom, poste recherché, localisation, e-mail, téléphone, LinkedIn) et 6 zones de texte libre (À propos, Expériences, Projets, Compétences, Formations, Exemples de textes), tous facultatifs, enregistrés d'un bloc.

## Constraints / Notes
- Décisions du 2026-10-01 : texte libre plutôt que fiches structurées ; objectif principal = lettre de motivation personnalisée par Annonce ; phase 5 abandonnée.
- Un profil par utilisateur (`userId` unique), `upsert` ; chaque colonne écrite, un champ vidé devient `null`.
- `emptyToUndefined` / `optionalText` sortis dans `src/lib/form-fields.ts` et `Field` / `SelectField` dans `src/components/form-fields.tsx` : partagés par trois modules (Candidatures, Entretiens, Profil).
- Vérifié dans le navigateur (base de dev) : e-mail invalide → message sous le champ et saisie gardée ; enregistrement → « Profil enregistré. », valeurs relues après rechargement ; profil de test supprimé ensuite.

## Missions
- [x] Mission 1: Modèle `Profile` + migration `profile`, schéma Zod + tests (AC-006-04)
- [x] Mission 2: `getProfile` / `saveProfile` + tests d'intégration (AC-006-01 à 03, 05)
- [x] Mission 3: Action, formulaire, page `/profile`, menu + tests de composant (AC-006-01, 02, 04)

## Review (2026-10-01)
- Corrigé : le Profil ne dépend plus du module Candidatures pour ses formulaires : `FormState` / `initialFormState` / `FormAction` dans `src/lib/form-state.ts`, `FormStateMessage` dans `src/components/` (renommage mécanique dans tout le code).
- Corrigé : `formValues(formData)` (`src/lib/form-fields.ts`) remplace trois copies de l'extraction des champs texte.
- Corrigé : commentaire de `form-fields.tsx` à jour ; `frontend-patterns.md` décrit les briques de formulaire communes.
- SPEC-006 amendée (BR-006-03) : le lien LinkedIn est limité à 2 048 caractères, comme le lien d'une Annonce, et non à 200.
