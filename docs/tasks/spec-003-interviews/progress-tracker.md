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

## Review (2026-10-01)
- Corrigé : une date qui passe l'expression régulière mais n'existe pas (30 février, mois 13, 25 h) faisait planter l'action ou décalait le jour → message « Date et heure invalides » ; `parisLocalToUtc` renvoie « Invalid Date » au lieu de lever une erreur.
- Corrigé : boutons « Modifier » / « Supprimer » d'un Entretien nommés par l'Entretien (« Supprimer : Entretien RH du … »), distincts quand la fiche en liste plusieurs.
- Corrigé : import en double sur la page ; type `FormAction` défini une seule fois (`form-state.ts`) au lieu de quatre.
- Ajouté : tests d'une heure inexistante (28 mars 2027, 2 h 30 → 3 h 30) et d'une heure doublée (25 oct. 2026, 2 h 30 → la seconde).
- Accepté (mono-utilisateur) : deux onglets qui ajoutent un Entretien et refusent la Candidature au même instant pourraient la faire sortir de Refusée ; même schéma que `changeApplicationStatus`, sans verrou de ligne.
