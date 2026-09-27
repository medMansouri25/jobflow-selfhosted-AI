# Post-Implementation Review: Pièces jointes PDF
**Reviewed**: 2026-09-28   **Scope**: missions 1–4 / commits main..59aa33e

## Applied — validé par l'utilisateur ✅
- [slop-defender] la cause d'un enregistrement échoué (après envoi des PDF) est journalisée (`console.error`), test ajouté — `service.ts`
- [reusability-inspector + slop-defender] « 4 Mo » dérivé de `MAX_ATTACHMENT_BYTES` (`MAX_ATTACHMENT_LABEL`) dans le message d'erreur et les deux libellés du formulaire — `schemas.ts`, `application-form.tsx`

## Écarté par l'utilisateur
- [reusability-inspector] composant `ExternalLink` pour les deux liens externes de la fiche (`application-detail.tsx`) — laissé tel quel.

## Clean lenses
- cleaner-architecture : aucune remarque
