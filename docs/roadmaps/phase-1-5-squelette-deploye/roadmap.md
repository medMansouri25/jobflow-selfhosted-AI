# Roadmap: Phase 1.5 — Squelette déployé (SPEC-010)

**Created**: 2026-09-30
**Status**: In dev (en ligne depuis le 2026-10-01 ; reste la vérification depuis l'iPhone)

## Objective
Depuis son téléphone ou son PC, où qu'il soit, l'utilisateur ouvre `https://jobflow.<tailnet>.ts.net` et utilise JobFlow « pour de vrai » : l'application tourne en permanence sur la Raspberry Pi, avec une base de production séparée de celle de développement, qui démarre vide. Chaque nuit, la base est sauvegardée ; le PC récupère les sauvegardes quand il est allumé, et une restauration a été testée.

## Tasks
- [x] **spec-010-deployment** — rédiger SPEC-010 (objectif, exigences, critères d'acceptation du déploiement), à partir de l'ADR 0007
      depends-on: []
      plan: ✅ planned        status: done
- [x] **dockerfile** — Dockerfile multi-étapes : sortie `standalone`, utilisateur non-root, `HEALTHCHECK` sur une route de santé
      depends-on: [spec-010-deployment]
      plan: ✅ planned        status: done
- [ ] **runbook-pi-setup** — compte Tailscale (créé par l'utilisateur), Tailscale sur la Pi, le PC et le téléphone, vérifications Docker ; procédure dans `docs/runbooks/` (commandes `sudo` lancées par l'utilisateur)
      depends-on: [spec-010-deployment]
      plan: ✅ planned        status: in-dev (reste : ouverture depuis l'iPhone en 4G)
- [x] **ci-docker-image** — CI : image ARM64 (`docker buildx`) publiée sur GHCR à chaque merge sur `main`
      depends-on: [dockerfile]
      plan: ✅ planned        status: done
- [ ] **prod-compose** — `docker-compose.prod.yml` (application + PostgreSQL de production séparé, vide) + Caddy en HTTPS `*.ts.net` + migrations au démarrage ; secrets (`DATABASE_URL`, `UPLOADTHING_TOKEN`, même app UploadThing que le dev) hors du dépôt
      depends-on: [dockerfile, runbook-pi-setup]
      plan: ✅ planned        status: in-dev (reste : ouverture depuis l'iPhone en 4G)
- [x] **deploy** — mettre à jour l'application sur la Pi depuis l'image GHCR avec `./deploy.sh` lancé à la main, retour arrière par `./deploy.sh <version>`
      depends-on: [ci-docker-image, prod-compose]
      plan: ✅ planned        status: done
- [x] **backups** — `pg_dump` chaque nuit sur la Pi (7 jours gardés), tâche planifiée Windows qui les récupère via Tailscale, restauration testée
      depends-on: [prod-compose]
      plan: ✅ planned        status: done

## Decisions
- **Q6** — base de production sur la carte SD de la Pi, sauvegardes récupérées par le PC → `docs/adr/0007-base-de-production-sur-la-pi.md`
- **Accès** — Tailscale sur la Pi, le PC et le téléphone, sans authentification applicative → `docs/adr/0001-acces-prive-tailscale-sans-authentification.md`
- **Données de départ** — la production démarre vide → `docs/adr/0007-base-de-production-sur-la-pi.md`
- **Mise à jour** — manuelle par `./deploy.sh`, avec retour arrière → `specs/010-deployment.md` (BR-010-01)
- **PDF en production** — même app UploadThing que le développement → `specs/010-deployment.md` (BR-010-04)

## Out of scope
- Assistant IA, bibliothèque de documents, notifications — phases suivantes.
- Accès public hors Tailscale — exclu par l'ADR 0001.
- Mise à jour automatique, SSD USB et copie des sauvegardes en ligne — possibles plus tard (ADR 0007), pas dans cette phase.
