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
