# Task: Entretiens d'une Candidature (T3.2 à T3.4)

**Status**: Completed
**Type**: Full-stack
**Created**: 2026-10-01

## Problem
Les Entretiens (RH, technique, manager…) ne sont notés nulle part, et la Candidature doit être passée en « Entretien » à la main (SPEC-003).

## Outcome
Depuis la fiche d'une Candidature : ajouter, modifier, supprimer un Entretien (date et heure de Paris, type, format, lieu ou lien, interlocuteur, préparation, compte rendu). Ajouter un Entretien à une Candidature Postulée la passe en Entretien, historique compris ; une Candidature Refusée n'en accepte plus.

## Constraints / Notes
- Décisions du 2026-10-01 : 7 champs ; Interlocuteur en texte libre (fiches Contact reportées) ; passage automatique en Entretien, rien sur Refusée, suppression sans retour en arrière ; heures de Paris.
- Les Entretiens vivent dans le module des Candidatures (`interviews.ts`) : l'ajout et le changement de statut sont dans une seule transaction (BR-003-01) ; `findOwnedApplication` est exporté pour cela.
- Heure : `datetime-local` saisi à Paris → instant UTC (`parisLocalToUtc`, décalage recalculé autour des changements d'heure) ; affichage `Intl` en `Europe/Paris`.
- `Field` / `SelectField` extraits dans `components/form-fields.tsx`, partagés par les deux formulaires.
- Prisma 7 : `migrate dev` ne régénère plus le client → `prisma generate`, et redémarrer `next dev` (sinon « Unknown field interviews »).
- Vérifié dans le navigateur (base de dev) : ajout sur une Candidature Postulée → statut Entretien, historique `Postulée → Entretien`, affichage « mer. 14 oct. 2026 · 10:30 ».

## Missions
- [x] Mission 1: Heure de Paris ↔ UTC (`src/lib/dates.ts`) + tests été / hiver / changement d'heure (AC-003-05)
- [x] Mission 2: Modèle `Interview` + migration `interviews`, vocabulaire (types, formats, libellés), schéma Zod + tests (AC-003-04, 05)
- [x] Mission 3: Service `addInterview` / `updateInterview` / `deleteInterview` + tests d'intégration (AC-003-01, 02, 03, 06, 09, 10)
- [x] Mission 4: Actions serveur, section « Entretiens » de la fiche, formulaire et fenêtres (ajout, modification, suppression) + tests de composant (AC-003-03, 04, 05)
