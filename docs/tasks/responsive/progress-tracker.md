# Task: Application adaptée au téléphone

**Status**: Completed
**Type**: Frontend
**Created**: 2026-10-01

## Problem
Sur iPhone, le menu latéral prenait la moitié de l'écran et le contenu était écrasé, alors que JobFlow s'utilise surtout sur téléphone depuis sa mise en ligne (phase 1.5).

## Outcome
Toutes les pages sont lisibles à 375 px sans défilement horizontal : menu en tiroir, barre du haut sur deux lignes, tableaux réduits aux colonnes essentielles, filtres repliables, graphique hebdomadaire à libellés courts.

## Missions
- [x] Mission 1: Menu en tiroir (`MobileNav` + `SidebarContent` partagé) + tests (ouverture, fermeture au choix d'une page)
- [x] Mission 2: Barre du haut, marges et titres des pages, tableaux (colonnes secondaires masquées), filtres repliables, tableau de bord (indicateurs 2 × 2, graphique)
- [x] Mission 3: Vérification à 375 px dans le navigateur (tableau de bord, liste, filtres dépliés, menu, fiche, formulaire de création) : largeur de document = 375 px partout ; `frontend-patterns.md`

## Review (2026-10-01)
- Corrigé : double bordure droite du 4ᵉ indicateur sur grand écran (ordre des variantes Tailwind `last` / `even`) → `odd:border-r … lg:border-r lg:last:border-r-0`.
- Corrigé : tiroir resté ouvert mais invisible après un passage à `lg` (iPad tourné) — page bloquée ; le tiroir n'est plus masqué en `lg`, il reste visible et refermable.
- Corrigé : le tri par défaut est une constante `DEFAULT_LIST_SORT` (schéma, filtres repliables, `listHref`) au lieu de `LIST_SORTS[0]` / `"modifiee"` répétés.
