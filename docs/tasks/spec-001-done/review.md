# Post-Implementation Review: Clôture de SPEC-001 (T1.10)
**Reviewed**: 2026-09-30   **Scope**: missions 1–3 / commits origin/main..HEAD

## Applied ✅
- [consistency] T0.1 : condition de fin alignée (SPEC-000 « Validée », SPEC-001 « Implémentée ») ; T1.3 et T1.5 cochées (livrées mais oubliées)
- [consistency] AC-001-20 : test ajouté avec un id bien formé mais inconnu ; ligne du tableau précisée (service testé, 404 de la fiche vérifiée à la main)
- [consistency → mission 3] FR-001-04 (autocomplétion de l'Entreprise) n'avait jamais été livrée : faite dans cette tâche (décision de l'utilisateur)
- [cleaner-architecture] suggestions d'Entreprise facultatives dans le layout (`.catch(() => [])`) : une erreur de base ne fait plus tomber toute l'application hors d'`error.tsx`
- [reusability-inspector] `listCompanyNames` enveloppé dans `cache()` : une lecture par requête au lieu de deux
- [slop-defender] quatre mentions « pré-rendu au build » devenues fausses (layout `force-dynamic`) reformulées — `app-topbar.tsx`, `frontend-patterns.md`, `application-form.test.tsx`
