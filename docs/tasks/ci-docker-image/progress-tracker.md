# Task: Image publiée par la CI (T1.5.3)

**Status**: In dev
**Type**: CI
**Created**: 2026-10-01
**Roadmap**: phase-1-5-squelette-deploye (tâche `ci-docker-image`)

## Problem
L'image ne se construit qu'à la main sur la Pi (≈ 15 min). La Pi doit pouvoir télécharger une image prête à chaque merge (FR-010-01, AC-010-01).

## Outcome
Workflow `Image Docker` : sur chaque PR, construit l'image ARM64 et vérifie qu'elle démarre sur une base vide (`/api/health` 200) ; sur `main`, la publie sur `ghcr.io/medmansouri25/jobflow-selfhosted-ai` avec les étiquettes `sha-<commit>` et `latest`.

## Constraints / Notes
- Machine ARM64 native `ubuntu-24.04-arm` (gratuite, dépôt public) : pas d'émulation QEMU.
- `docker/metadata-action` met le nom en minuscules (GHCR l'exige ; le compte est `medMansouri25`).
- Cache des couches dans le cache GitHub Actions (`type=gha`).
- Authentification GHCR par `GITHUB_TOKEN` (permission `packages: write`), aucun secret à créer.
- Le dépôt est public, l'image ne contient aucun secret : le paquet GHCR peut être rendu **public**, la Pi le télécharge alors sans jeton. Réglage à faire une fois par l'utilisateur (paquet → Package settings → Change visibility).
- Étiquette `sha-<7 caractères>` : c'est la `<version>` de `./deploy.sh <version>` (tâche `deploy`).

## Missions
- [x] Mission 1: CI — `.github/workflows/docker-image.yml` (construction ARM64, essai de démarrage, publication sur main)
- [ ] Mission 2: Vérification — le workflow passe sur la PR ; après merge, l'image `sha-…` et `latest` existe sur GHCR et la Pi la télécharge (`docker pull`)
