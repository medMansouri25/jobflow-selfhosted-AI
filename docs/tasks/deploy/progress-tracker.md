# Task: Déploiement (T1.5.6)

**Status**: In dev
**Type**: Infra
**Created**: 2026-10-01
**Roadmap**: phase-1-5-squelette-deploye (tâche `deploy`)

## Problem
Mettre à jour la production demande aujourd'hui plusieurs commandes à la main, sans retour arrière (FR-010-07, FR-010-08).

## Outcome
`./deploy.sh [version]` dans `~/jobflow-prod` : télécharge l'image GHCR, sauvegarde, note la version dans `.env`, redémarre, attend « healthy » ; en cas d'échec, propose `./deploy.sh sha-<précédente>`.

## Constraints / Notes
- Mise à jour manuelle uniquement (BR-010-01) ; pas de retour arrière automatique (BR-010-03).
- La version précédente est lue sur le label `org.opencontainers.image.revision` de l'image en cours (posé par `docker/metadata-action`) → `sha-<7>`, la même étiquette que la CI publie.
- Le premier `./deploy.sh` retire de `.env` la ligne temporaire `JOBFLOW_IMAGE=jobflow` (image locale `jobflow:test`) et passe sur GHCR.
- Prérequis : image publiée (merge de la PR de la CI) et paquet GHCR rendu **public** par l'utilisateur.

## Missions
- [x] Mission 1: Infra — `deploy/deploy.sh`, section « Mettre à jour » de `docs/runbooks/production.md` ; vérifié : version introuvable → code 1, `.env` et conteneurs inchangés
- [ ] Mission 2: Vérification — après la première publication GHCR : `./deploy.sh` (latest) → healthy (AC-010-05) ; `./deploy.sh sha-<précédente>` → retour arrière, données intactes (AC-010-06)
