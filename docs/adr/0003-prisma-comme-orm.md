# Prisma comme ORM

L'accès à PostgreSQL passe par Prisma (version 7, sans moteur Rust). Drizzle était l'alternative sérieuse — plus léger et plus proche du SQL — mais Prisma a été retenu pour la maturité de son outil de migrations (`prisma migrate`), plus rassurant sur un premier projet, et pour sa forte présence dans les offres d'emploi. Depuis la version 7, l'argument « trop lourd sur ARM64 / Raspberry Pi » ne tient plus.

## Consequences

- Le choix de l'hébergement de la base (PostgreSQL sur la Pi ou Neon) ne dépend pas de l'ORM : seule `DATABASE_URL` change. Avec Neon, utiliser l'URL *pooled* pour l'application et l'URL *directe* pour les migrations.
- La version de Prisma installée est documentée dans `docs/architecture/tech-stack.md`.
