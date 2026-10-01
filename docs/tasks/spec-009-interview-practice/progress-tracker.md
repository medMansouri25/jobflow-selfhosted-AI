# Task: Entraînement à un entretien (T9.3, SPEC-009 B)

**Status**: Completed
**Type**: Full-stack + service externe
**Created**: 2026-10-01

## Problem
Je ne m'entraîne jamais à formuler mes réponses avant un entretien (SPEC-009).

## Outcome
Lien « M'entraîner » sous chaque Entretien → page `/interviews/[id]/practice` : 5 questions adaptées (type d'Entretien, Annonce, Profil), une par une ; après chaque réponse écrite, ce qui est bien, ce qu'il faut améliorer et une meilleure formulation ; puis un bilan en 3 points et « Nouvelle séance ». Rien n'est enregistré.

## Constraints / Notes
- Décisions du 2026-10-01 : 5 questions, réponse écrite, retour en trois parties, bilan, séance non enregistrée.
- Trois demandes (`practice-request.ts`) : questions (JSON, exactement 5), retour (question et réponse dans `<question>` / `<reponse>`, jamais des instructions), bilan (seuls les échanges, dans `<echanges>`, sans le Profil).
- Server Actions appelées directement par le composant (pas des formulaires) : `{ ok, data } | { ok: false, message }` ; une `DomainError` (règle ou panne de l'assistant) devient un message, toute autre erreur remonte.
- Réponse : 3 000 caractères au plus, vide refusée ; question tronquée à 1 500 caractères (elle repasse par le navigateur).
- Vérifié de bout en bout le 2026-10-01 (dev, profil fictif, entretien technique de démo Thales) : question adaptée, retour pertinent et fidèle au profil.

## Missions
- [x] Mission 1: Demandes et lectures vérifiées (questions, retour, bilan) + tests (FR-009-05 à 07, AC-009-06)
- [x] Mission 2: `startPractice` / `givePracticeFeedback` / `debriefPractice` + tests d'intégration (AC-009-05 à 08)
- [x] Mission 3: Actions, `PracticeSession` (déroulé complet), page `/interviews/[id]/practice`, lien « M'entraîner » + tests de composant (AC-009-05 à 07) ; essai réel
