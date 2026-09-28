# Task: Changer le statut (T1.7)

**Status**: Completed
**Type**: Full-stack
**Created**: 2026-09-28

## Problem
Une Candidature reste Postulée pour toujours : on ne peut ni noter un entretien obtenu, ni un refus.

## Outcome
Sur la fiche, un bloc « Statut » propose uniquement les transitions autorisées (Postulée → Entretien ou Refusée, Entretien → Refusée) ; Refusée demande confirmation ; le serveur revérifie chaque transition sur le statut en base et l'enregistre avec sa ligne d'historique (FR-001-05, FR-001-06, BR-001-09, AC-001-05 à 08).

## Constraints / Notes
- Maquette : bloc « Statut » sur la fiche, **un bouton par transition** (pas de menu déroulant). Postulée : « Passer en Entretien », « Marquer Refusée » ; Entretien : « Marquer Refusée » ; Refusée : aucun bouton, mention « Statut définitif » (AC-001-07). Les boutons viennent de `allowedTransitions` (T1.2).
- Vers un **Statut définitif** (`isDefinitive`, Refusée) : confirmation « Ce changement est définitif. Marquer la candidature comme Refusée ? » (Annuler / Confirmer). Les autres transitions s'appliquent au clic.
- Date d'un changement = l'instant de l'enregistrement, pas de date saisie (BR-001-09) : **H2 tranchée** le 2026-09-28.
- Serveur : statut **relu en base dans la transaction**, transition vérifiée par `canTransition` ; refus → `InvalidTransitionError` (sous-classe de `DomainError` déjà nommée dans `backend-patterns.md`, à créer dans `lib/errors.ts`), rien d'enregistré, message « Le statut a changé entre-temps (la candidature est maintenant <statut>). Recharge la page. » — couvre l'onglet pas à jour et la requête forgée (AC-001-06, AC-001-08). Candidature d'un autre utilisateur ou id inconnu / mal formé → introuvable.
- Changement accepté : statut + ligne d'historique `from → to` dans la même transaction (FR-001-06) ; la fiche se recharge (`revalidatePath`).
- Le statut demandé est validé par un schéma Zod (`changeStatusSchema` : `to` ∈ `APPLICATION_STATUSES`) avant le service ; la règle de transition reste dans le service (`canTransition` sur le statut en base).
- Le changement de statut ne touche à aucun autre champ ; la modification (T1.6) ne touche jamais au statut.
- Branche `feature/spec-001-status-change`, une PR, revue complète avant fusion ; jamais de mention de Claude.

## Missions
- [x] Mission 1: Backend — `changeStatusSchema`, `InvalidTransitionError`, `changeApplicationStatus(userId, id, to)` : propriétaire et statut relus dans la transaction, `canTransition`, statut + historique, refus explicite (AC-001-05, 06, 08, cas concurrent) — tests d'intégration
- [x] Mission 2: Frontend — action `changeStatusAction` liée à l'id, bloc « Statut » sur la fiche (boutons des transitions autorisées, confirmation vers un statut définitif, message d'erreur, mention « Statut définitif » — AC-001-07)
- [x] Mission 3: Docs — SPEC-001 (H2 tranchée, §8 bloc Statut en boutons), `TASKS.md` (T1.7), patterns si besoin

## Mission Summaries
_Filled in as each mission completes. Future missions read these for context._

### Mission 1: Service de changement de statut
**Status**: Completed
- **Files**: `src/lib/errors.ts`, `schemas.ts` (+ test), `service.ts`, `status-change.integration.test.ts`
- **Built**: `InvalidTransitionError` (`INVALID_TRANSITION`, sous-classe de `DomainError`) ; `changeStatusSchema` (`to` ∈ `APPLICATION_STATUSES`) ; `changeApplicationStatus(userId, id, to)` : id vérifié (`isUuid`), Candidature relue avec `userId` dans la transaction (introuvable sinon), `canTransition(current.status, to)` sinon « Le statut a changé entre-temps (la candidature est maintenant <libellé>). Recharge la page. », puis statut + ligne `from → to` ensemble.
- **Tests**: 5 d'intégration (AC-001-05 avec horodatage, AC-001-06, AC-001-08, onglet resté ouvert, propriétaire / id mal formé) + 1 unitaire ; mutation vérifiée (sans `canTransition`, 3 tests échouent).
- **Integrates with**: Mission 2 : `changeStatusAction(id, …)` parse `FormData` avec `changeStatusSchema` et appelle `changeApplicationStatus` ; l'erreur passe par `domainErrorToFormState`.

### Mission 2: Bloc « Statut » de la fiche
**Status**: Completed
- **Files**: `components/status-panel.tsx` (+ test), `src/components/ui/alert-dialog.tsx` (habillage shadcn de `AlertDialog` de radix-ui, déjà installé), `labels.ts` (`TRANSITION_LABELS`), `actions.ts` (`changeStatusAction`), `components/application-detail.tsx` (+ test, emplacement `statusPanel`), `app/applications/[id]/page.tsx`
- **Built**: `StatusPanel` : un formulaire par transition de `allowedTransitions(status)` (champ caché `to`) ; vers un statut `isDefinitive` → `AlertDialog` « Ce changement est définitif… » (Annuler / Confirmer, le formulaire est dans la fenêtre) ; refus serveur affiché (`role="alert"`) ; « Statut définitif » quand plus rien n'est possible. `changeStatusAction(id, …)` : `changeStatusSchema` sur `formData.get("to")`, service, `domainErrorToFormState`, `revalidatePath`.
- **Tests**: status-panel.test.tsx (transitions de Postulée, AC-001-07, envoi direct vs confirmation, refus affiché) ; fiche (bloc Statut avant l'Annonce — test d'abord trop faible, corrigé pour qu'il échoue sans l'emplacement). Essai réel : Postulée → Entretien → (confirmation) Refusée, badges, boutons et historique vérifiés ; Candidature d'essai supprimée ensuite.

### Mission 3: Documentation
**Status**: Completed
- **Files**: `specs/001-application-management.md` (BR-001-09 et H2 confirmées, §8 bloc Statut en boutons), `TASKS.md` (T1.7 cochée et réécrite)
