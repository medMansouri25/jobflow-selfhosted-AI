# Task: Page « Entreprises » et menu nettoyé

**Status**: Completed
**Type**: Full-stack
**Created**: 2026-10-01

## Problem
Le menu montrait encore deux emplacements réservés sans lien : « Entreprises (P1) », jamais construit, et « Assistant IA (P7) », devenu trompeur (l'IA vit sur les fiches de Candidature et d'Entretien).

## Outcome
« Assistant IA » et la rubrique « Phases suivantes » retirés ; « Entreprises » devient une page : la liste (nombre de Candidatures, répartition par statut, dernière activité, la plus récente d'abord) et la fiche d'une Entreprise (site web, Candidatures, Entretiens avec « Rejoindre »). Sur la fiche d'une Candidature, le nom de l'Entreprise mène à sa fiche.

## Constraints / Notes
- Décision du 2026-10-01 : retirer « Assistant IA », construire « Entreprises » (version simple, en lecture seule).
- `src/modules/companies/overview.ts` : lecture seule, filtrée par utilisateur, id vérifié (introuvable comme les autres fiches) ; une Entreprise sans Candidature reste listée (à 0, en fin de liste).
- Vérifié dans le navigateur (base de dev) : liste de 7 Entreprises, fiche Thales avec sa Candidature et son Entretien.

## Missions
- [x] Mission 1: `listCompanyOverviews` / `getCompanyOverview` + tests d'intégration
- [x] Mission 2: `CompaniesList`, pages `/companies` et `/companies/[id]`, lien depuis la fiche d'une Candidature, menu + tests

## Review (2026-10-01)
- Corrigé : la fiche d'une Entreprise est un composant du module (`CompanyDetail`, testé) ; la page ne fait que l'assembler. Les Entretiens sont lus et triés par une seule requête dans `getCompanyOverview`.
- Corrigé : plus de marges négatives autour de la liste d'Entretiens (même présentation que la page « Entretiens »).
- Retiré : le site web de l'Entreprise, que rien ne permet de saisir (code jamais atteint) ; à rajouter avec un formulaire d'Entreprise si besoin.
