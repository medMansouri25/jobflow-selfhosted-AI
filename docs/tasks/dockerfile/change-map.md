# Change Map: Image Docker de l'application (T1.5.2)

## Planned — 2026-09-30

```
app (api/health)   [touched]   route.ts
                          → unchanged behaviour, now covered by tests (200 / 503)
        │
prisma (migrations)   [extended]   new migration single_user
                          → the empty production database gets its single user without the seed
        │
build & runtime (Docker image)   [added]   Dockerfile · .dockerignore · docker/app/start.sh · next.config.ts
                          → standalone Next.js server, migrations on start, non-root, HEALTHCHECK
        │
docs (architecture · TASKS · roadmap)   [touched]
```

## Actual — 2026-10-01, origin/main..HEAD

```
app (api/health)   [touched]   route.test.ts · route.integration.test.ts
                          → behaviour unchanged, 200 / 503 covered
        │
prisma (migrations)   [extended]   20260930220000_single_user · src/test/single-user-migration.integration.test.ts
                          → every migrated database has the single user
        │
build & runtime (Docker image)   [added]   Dockerfile · .dockerignore · docker/app/start.sh · next.config.ts
                          → standalone server, migrations on start (exit 1 on failure), non-root, HEALTHCHECK, OpenSSL
        │
docs (architecture · TASKS · roadmap)   [touched]
```

## Drift

No module drift: the four planned modules, no others. Worth noting: the Pi's Docker has no BuildKit, so the Dockerfile avoids BuildKit-only syntax; the CI build (`ci-docker-image`) uses buildx and is not bound by that.
