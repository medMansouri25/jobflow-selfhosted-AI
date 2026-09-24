# Change Map: Socle technique

## Planned — 2026-09-24, at task creation
_Predicted from missions 1–3. Not edited afterwards; drift is measured against it._

```
Vitest (projets unit / integration)   [NEW]        M1
                          + test · test:unit · test:integration (scripts npm)
                          ▲ will be called by  M3 test d'intégration
                          → runs unit tests in parallel and integration tests serially against jobflow_test
        │
PostgreSQL local (docker-compose)     [NEW]        M2
                          + jobflow_dev · jobflow_test
                          → gives dev and tests a real PostgreSQL 18 without touching the code on exFAT
        │
lib/env                   [NEW]        M2
                          ▲ will be called by  lib/db
                          → refuses to start the app when DATABASE_URL is missing or invalid
        │
prisma (schéma, migrations, seed)     [NEW]        M3
                          + User
                          └ will use   PostgreSQL local
                          → versions the data model and seeds the single user
        │
lib/db                    [NEW]        M3
                          └ will use   lib/env · prisma
                          ▲ will be called by  lib/current-user · api/health · utilitaire de test
                          → the one Prisma client every service will share
        │
lib/current-user          [NEW]        M3
                          + getCurrentUserId
                          └ will use   lib/db
                          → the single place that knows who the user is (future auth seam)
        │
lib/errors                [NEW]        M3
                          + DomainError
                          → turns business-rule violations into a form-level action state
        │
utilitaire de test d'intégration      [NEW]        M3
                          └ will use   lib/db · Vitest
                          → migrates jobflow_test and empties its tables before each integration test
        │
api/health                [NEW]        M3
                          └ will use   lib/db
                          → answers 200 when the database answers, for Docker and Caddy later

also planned: package.json · .env.example · docs/architecture/tech-stack.md · backend-patterns.md
```
