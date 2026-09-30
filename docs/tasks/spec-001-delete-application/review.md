# Post-Implementation Review: Supprimer une Candidature (T1.8)
**Reviewed**: 2026-09-30   **Scope**: missions 1–3 / commits origin/feature/spec-001-status-change..958ef29 (branche empilée sur T1.7)

## Applied — safe fix ✅
- [reusability-inspector] `toStoredFile(attachment)` (inverse de `toAttachmentRow`) remplace les deux conversions écrites à la main dans `updateApplication` et `deleteApplication` — `service.ts`

## Clean lenses
- cleaner-architecture : aucune remarque
- slop-defender : aucune remarque
