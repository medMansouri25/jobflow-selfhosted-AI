# Post-Implementation Review: Changer le statut (T1.7)
**Reviewed**: 2026-09-28   **Scope**: missions 1–3 / commits main..ff9322a

## Applied — validé par l'utilisateur ✅
- [reusability-inspector] `findOwnedApplication(client, userId, id, include?)` : seul accès « par id » du service (id mal formé, inconnu ou d'un autre utilisateur → introuvable), utilisé par la fiche, la modification et le changement de statut ; mutation vérifiée (sans filtre `userId`, 4 tests échouent) — `service.ts`
- [reusability-inspector] `Section` partagée (`components/section.tsx`) par la fiche et le bloc Statut
- [reusability-inspector] `FormStateMessage` partagé par le formulaire et le bloc Statut ; le succès « Statut : … » s'affiche désormais (test ajouté)
- [slop-defender] libellé impossible « Repasser en Postulée » supprimé : `TransitionTarget` (statuts atteignables) dérivé de `STATUS_TRANSITIONS`, `allowedTransitions` et `TRANSITION_LABELS` typés avec — `status.ts`, `labels.ts`

## Clean lenses
- cleaner-architecture : aucune remarque
