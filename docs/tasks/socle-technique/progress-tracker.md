# Task: Socle technique (T0.4 + T0.5 + T0.6)

**Status**: In dev
**Type**: Backend (outillage)
**Created**: 2026-09-24

## Problem
Aucun lanceur de tests, aucune base de données ni accès aux données n'existent : impossible de développer SPEC-001 en TDD.

## Outcome
`npm test` fonctionne (projets unit / integration), PostgreSQL tourne en local avec `jobflow_dev` et `jobflow_test`, Prisma est branché, l'utilisateur unique est seedé et `/api/health` répond.

## Constraints / Notes
- Une branche et une PR par mission (`chore/vitest`, `chore/docker-postgres`, `chore/prisma-setup`), chacune partant d'un `main` à jour ; l'utilisateur fusionne la PR avant la mission suivante. Jamais de push sur `main`, jamais de mention de Claude dans les commits.
- Prérequis : PR `docs/project-tasks` et `chore/project-setup` fusionnées.
- PostgreSQL 18 (`postgres:18-alpine`, ARM64), port 5432 ; Zod 4 ; Prisma 7 avec `@prisma/adapter-pg` (ADR `0003`).
- Next.js tourne nativement sous Windows ; seul PostgreSQL est dans Docker (projet sur exFAT, npm).
- Tests d'intégration en série sur `jobflow_test`, tables vidées avant chaque test (`tech-stack.md`).
- Chaque nouvelle dépendance est justifiée dans la PR et ses versions ajoutées à `docs/architecture/tech-stack.md` ; docs d'architecture mis à jour à chaque mission.
- Hors périmètre : CI (T0.7), shadcn/ui (T0.8), modèle métier SPEC-001.

## Missions
- [x] Mission 1: Backend — Vitest : projets `unit` (parallèle) et `integration` (série), scripts `test` / `test:unit` / `test:integration`, premier test unitaire (`chore/vitest`)
- [ ] Mission 2: Backend — PostgreSQL local : `docker-compose.yml` (volume, init des bases `jobflow_dev` / `jobflow_test`), `.env.example`, `src/lib/env.ts` validé par Zod qui rejette une config invalide (`chore/docker-postgres`)
- [ ] Mission 3: Backend — Prisma : modèle `User`, migration, seed, `lib/db.ts`, `lib/current-user.ts`, `lib/errors.ts` (`DomainError` → état d'action), utilitaire de test d'intégration, `/api/health` (`chore/prisma-setup`)

## Mission Summaries
_Filled in as each mission completes. Future missions read these for context._

### Mission 1: Vitest
**Status**: Completed — branche `chore/vitest`
- **Files**: `vitest.config.mts`, `src/app/page.test.tsx`, `package.json` (scripts + devDependencies), `docs/architecture/{tech-stack,backend-patterns,frontend-patterns}.md`
- **Built**: trois projets Vitest choisis par le nom du fichier — `unit` (`*.test.ts`, Node), `component` (`*.test.tsx`, jsdom), `integration` (`*.integration.test.ts`, Node, `fileParallelism: false`). Scripts `test`, `test:unit` (unit + component), `test:integration` (`--passWithNoTests` tant qu'il n'y a aucun test), `test:watch`.
- **Tests**: `src/app/page.test.tsx` — la page d'accueil affiche le titre « JobFlow AI » (vérifié : échoue si le titre change).
- **Patterns**: alias `@/` résolu par Vite (`resolve.tsconfigPaths`) ; Testing Library par rôle accessible.
- **Integrates with**: Mission 3 écrit le premier `*.integration.test.ts` et retire `--passWithNoTests`.
- **Gotchas**: écart avec le plan — projet `component` + jsdom + Testing Library ajoutés (option A validée) ; pas de `globals`, donc Testing Library ne nettoie pas le DOM automatiquement entre deux tests d'un même fichier : à ajouter (`cleanup` en `afterEach`) au premier fichier qui rend plusieurs composants.
