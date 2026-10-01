# Task: Image Docker de l'application (T1.5.2)

**Status**: Completed
**Type**: Backend / infra
**Created**: 2026-09-30
**Roadmap**: phase-1-5-squelette-deploye (tâche `dockerfile`)

## Problem
JobFlow ne sait tourner qu'avec `npm run dev`. Pour vivre sur la Raspberry Pi, il faut une image Docker autonome qui démarre sur une base de production vide, applique les migrations et dise si elle est en bonne santé (SPEC-010).

## Outcome
`docker build` produit une image (ARM64 sur la Pi) qui, au démarrage, applique les migrations en attente, refuse de démarrer si une migration échoue, crée l'utilisateur unique s'il n'existe pas, puis sert l'application sous un utilisateur non-root, avec un `HEALTHCHECK` sur `/api/health`. Vérifié en construisant et en lançant l'image sur la Pi contre une base jetable.

## Constraints / Notes
- SPEC-010 : FR-010-05 (migrations au démarrage), FR-010-06 et AC-010-07 (`/api/health`), BR-010-05 (migration en échec → pas de démarrage), sécurité (non-root, aucun secret dans l'image).
- Base de production vide (ADR 0007) : sans utilisateur, `getCurrentUserId` lève une erreur. L'utilisateur unique est créé par une **migration SQL idempotente** (`INSERT … WHERE NOT EXISTS`), sans seed ni `tsx` dans l'image ; le seed de dev reste.
- Image : `node:24-bookworm-slim` (Node ≥ 24 imposé par `engines`) ; sortie Next.js `standalone` ; CLI Prisma installée à part (`/opt/migrate`) pour `prisma migrate deploy` ; `HEALTHCHECK` en `node -e fetch(...)` (pas de curl dans l'image).
- `DATABASE_URL` factice au moment du build (le module `db` est évalué pendant `next build`) ; aucun secret copié (`.dockerignore` exclut `.env*`, `node_modules`, `.next`, docs, maquette).
- Docker Desktop est cassé sur le PC : l'image est construite et essayée **sur la Pi** (ARM64 natif), via `ssh mohammed@jobflow`.
- Hors périmètre : publication GHCR (tâche `ci-docker-image`), compose de production, Caddy, `deploy.sh`.
- Branche `chore/dockerfile`, une PR ; jamais de mention de Claude.

## Missions
- [x] Mission 1: Backend — tests de `/api/health` : 200 base joignable (intégration), 503 base injoignable (unitaire, `db` simulé) — AC-010-07
- [x] Mission 2: Backend — migration `single_user` qui crée l'utilisateur unique s'il n'existe pas, testée en intégration (base sans utilisateur → un seul ; rejouée → toujours un seul ; utilisateur existant → inchangé)
- [x] Mission 3: Infra — `Dockerfile` multi-étapes, `.dockerignore`, `output: "standalone"`, script de démarrage (migrations puis serveur, arrêt si échec), `HEALTHCHECK` ; vérifié sur la Pi (build ARM64, démarrage sur base vide → 200, base arrêtée → 503 / unhealthy, utilisateur non-root, migration cassée → pas de démarrage)
- [x] Mission 4: Docs — `tech-stack.md` / `backend-patterns.md` (image, démarrage, utilisateur créé par migration), TASKS.md, roadmap

## Mission Summaries
_Filled in as each mission completes._

### Mission 1: Tests de `/api/health`
**Status**: Completed
- **Files**: `src/app/api/health/route.integration.test.ts`, `route.test.ts`
- **Built**: rien de nouveau (la route existait) ; 200 contre la vraie base de test, 503 avec `db.$queryRaw` simulé en échec (on ne coupe pas la base partagée).
- **Integrates with**: le `HEALTHCHECK` de l'image (Mission 3) et, plus tard, `deploy.sh`.

### Mission 2: Utilisateur unique créé par migration
**Status**: Completed
- **Files**: `prisma/migrations/20260930220000_single_user/migration.sql`, `src/test/single-user-migration.integration.test.ts`
- **Built**: `INSERT INTO "User" SELECT gen_random_uuid() WHERE NOT EXISTS (…)` ; appliquée à `jobflow_dev` (sans effet : l'utilisateur existait) et `jobflow_test`.
- **Tests**: le test rejoue le SQL du fichier : base sans utilisateur → 1 ; rejoué deux fois → 1 ; utilisateur existant → inchangé.
- **Integrates with**: la base de production vide (ADR 0007) a son utilisateur dès le premier démarrage, sans seed ni `tsx` dans l'image.

### Mission 3: Dockerfile
**Status**: Completed
- **Files**: `Dockerfile`, `.dockerignore`, `docker/app/start.sh`, `next.config.ts` (`output: "standalone"`)
- **Built**: 4 étapes (`deps`, `builder`, `migrate` = CLI Prisma + dotenv aux versions du lockfile dans `/opt/migrate`, `runner`) ; `start.sh` : `prisma migrate deploy` puis `exec node server.js`, `set -e` ; utilisateur `node` ; `HEALTHCHECK` par `fetch` ; OpenSSL installé (sinon avertissement de Prisma). Compatible avec le constructeur Docker « legacy » de la Pi (pas de BuildKit : pas de `--chmod`, pas de ligne `syntax`).
- **Vérifié sur la Pi le 2026-10-01** (image `jobflow:test`, 750 Mo, base PostgreSQL 18 jetable) : 4 migrations appliquées sur base vide, 1 utilisateur ; `/api/health` 200 et page d'accueil 200 ; `id` → `uid=1000(node)` ; base arrêtée → 503 et conteneur `unhealthy` ; redémarrage → « No pending migrations », toujours 1 utilisateur ; base non vide non baselinée → `P3005`, code de sortie 1, serveur jamais démarré (BR-010-05).
- **Integrates with**: `ci-docker-image` construit ce Dockerfile avec buildx pour ARM64 ; `prod-compose` fournit `DATABASE_URL` / `UPLOADTHING_TOKEN` à l'exécution et publie le port 3000 derrière Caddy.

### Mission 4: Docs
**Status**: Completed
- **Files**: `docs/architecture/tech-stack.md` (points d'entrée), `backend-patterns.md` (utilisateur unique, migrations au démarrage), `TASKS.md`, roadmap.
