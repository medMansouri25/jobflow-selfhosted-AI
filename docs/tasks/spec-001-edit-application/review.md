# Post-Implementation Review: Modifier une Candidature (T1.6)
**Reviewed**: 2026-09-28   **Scope**: missions 1–3 / commits main..77fdf27

## Applied — validé par l'utilisateur ✅
- [slop-defender] commentaire obsolète supprimé — `new-application-dialog.tsx`
- [reusability-inspector] libellés des pièces jointes du formulaire tirés de `ATTACHMENT_KIND_LABELS` — `application-form.tsx`
- [cleaner-architecture] `toColumns` rejoint `toFormValues` dans `form-values.ts` ; convention de date nommée une fois (`dateOnlyToColumn` / `columnToDateOnly`) ; test aller-retour saisie → colonnes → formulaire

## Écarté par l'utilisateur
- [cleaner-architecture + reusability-inspector] table unique type de pièce jointe → champs (`cv` / `removeCv`, `coverLetter` / `removeCoverLetter`), aujourd'hui écrite dans le schéma, le service et le formulaire. Laissé tel quel tant qu'il n'y a que deux types ; à reprendre si un troisième arrive.
