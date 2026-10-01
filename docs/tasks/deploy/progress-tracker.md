# Task: Déploiement (T1.5.6)

**Status**: Completed
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
- [x] Mission 2: Vérification sur la Pi le 2026-10-01, image GHCR (paquet déjà public : `docker pull` sans connexion) : `./deploy.sh` (latest) → healthy, ligne temporaire `JOBFLOW_IMAGE` retirée ; `./deploy.sh sha-34c6632` → retour arrière healthy, puis `./deploy.sh latest` → `sha-72a26fe` retenu dans `.last-good` ; utilisateur unique inchangé, HTTPS 200 (AC-010-05, AC-010-06)

## Review (2026-10-01)
- Corrigé : la version est écrite dans `.env` par `sed` seul (un `.env` sans retour à la ligne final cassait `UPLOADTHING_TOKEN`) — vérifié.
- Corrigé : `docker compose up` en échec n'interrompt plus le script avant le message de retour arrière.
- Corrigé : sortie anticipée sur `State.Status` (en boucle de redémarrage, `Running` reste vrai) au lieu d'attendre 180 s.
- Corrigé : la version proposée est la **dernière saine** (`.last-good`, écrite quand le conteneur devient « healthy », révision vérifiée en hexadécimal), plus celle qui tourne, peut-être cassée.
- Corrigé (doc + message) : après une migration en échec, le retour arrière seul ne suffit pas (Prisma P3009) : le script affiche la sauvegarde faite juste avant, à restaurer d'abord.
- Accepté : au premier déploiement depuis l'image locale `jobflow:test`, aucune version saine n'est connue (pas de label de révision) ; aucune commande de retour n'est proposée.
- `deploy.sh` appelle `backup.sh` : la branche contient celle des sauvegardes (fusionner #22, #23 puis #24).
- Corrigé après le premier vrai déploiement : `sed '$a …'` ne s'exécutait pas quand la dernière ligne de `.env` était justement celle supprimée → `JOBFLOW_VERSION` disparaissait (compose retombait sur `latest`). Suppression, retour à la ligne final, puis `echo >>` séparés.
