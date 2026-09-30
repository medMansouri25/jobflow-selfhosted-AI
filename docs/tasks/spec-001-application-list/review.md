# Post-Implementation Review: Liste, recherche, filtres, tri (T1.9)
**Reviewed**: 2026-09-30   **Scope**: missions 1–3 / commits main..e59a8ea

## Applied — validé par l'utilisateur ✅
- [slop-defender] `PAGE_SIZE` n'est plus exporté (rien ne l'importait) — `service.ts`
- [cleaner-architecture] `hasActiveFilters(filters)` à côté du schéma (test ajouté) ; la page ne recalcule plus elle-même si des filtres sont actifs — `schemas.ts`, `app/applications/page.tsx`

## Écarté par l'utilisateur
- [cleaner-architecture] un seul module « requête de liste » (schéma, `listHref`, noms de paramètres d'adresse en constantes utilisées par le formulaire). Aujourd'hui les noms `q`, `statut`, `contrat`, `source`, `tri` sont écrits dans le schéma, `listHref` et `ApplicationFilters` ; à regrouper si un filtre s'ajoute.

## Clean lenses
- reusability-inspector : aucune remarque
