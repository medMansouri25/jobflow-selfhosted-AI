# Task: Installation de production (T1.5.5)

**Status**: In dev
**Type**: Infra
**Created**: 2026-10-01
**Roadmap**: phase-1-5-squelette-deploye (tâche `prod-compose`)

## Problem
L'image existe, mais rien ne la fait tourner sur la Pi avec une base de production à elle, ni ne l'expose en HTTPS au tailnet.

## Outcome
`~/jobflow-prod` sur la Pi : application + PostgreSQL de production (Compose), base vide, application sur `127.0.0.1:3000` seulement, HTTPS par `tailscale serve` à `https://jobflow.taile9849c.ts.net`.

## Constraints / Notes
- Décision du 2026-10-01 : **`tailscale serve` au lieu de Caddy** (moins de pièces, certificat renouvelé par Tailscale, application jamais exposée au réseau local).
- Secrets dans `~/jobflow-prod/.env` (`600`), jamais dans le dépôt ; `POSTGRES_PASSWORD` aléatoire ; `UPLOADTHING_TOKEN` copié du `.env` de dev sans être affiché.
- En attendant la première image GHCR (merge de la PR de la CI), `.env` pointe temporairement sur l'image `jobflow:test` construite sur la Pi (`JOBFLOW_IMAGE=jobflow`, `JOBFLOW_VERSION=test`) ; la tâche `deploy` repasse sur GHCR.
- La base de dev de la Pi écoute toujours sur `0.0.0.0:5432` (réseau local) : hors de cette tâche, la production n'a aucun port publié.

## Missions
- [x] Mission 1: Infra — `deploy/docker-compose.prod.yml`, `deploy/.env.example`, `docs/runbooks/production.md`
- [x] Mission 2: Vérification — sur la Pi le 2026-10-01 : app et db « healthy », `/api/health` 200, 1 utilisateur et 0 Candidature, port 3000 lié à `127.0.0.1` seulement (PC → `192.168.1.65:3000` et `100.76.35.34:3000` : pas de réponse), aucun port publié pour la base
- [ ] Mission 3: Manuel — l'utilisateur active HTTPS Certificates et lance `sudo tailscale serve --bg 3000` ; ouverture depuis le téléphone (AC-010-02)
