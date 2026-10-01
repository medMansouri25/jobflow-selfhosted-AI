# Review — Image Docker (T1.5.2), 2026-10-01

Trois critiques (architecture, anti-superflu, réutilisation) sur `main...chore/dockerfile`. Règles SPEC-010 respectées : migrations au démarrage avec arrêt sur échec, aucun secret dans l'image, utilisateur non-root, `HEALTHCHECK` sur `/api/health`.

| # | Constat | Suite |
|---|---|---|
| 1 | `current-user.ts` et `schema.prisma` disaient encore « créé par le seed » ; l'erreur conseillait `npm run db:seed`, impossible dans l'image | **Corrigé** : renvoi à la migration `single_user` et à `prisma migrate deploy` |
| 2 | Le seed (`prisma/seed.ts`, `db:seed`, entrée `seed` de `prisma.config.ts`) ne crée plus jamais rien : les migrations passent toujours avant lui | **Ouvert, décision utilisateur** : le supprimer, ou le garder comme redondant |
| 3 | `route.test.ts` : `await import` inutile (`vi.mock` est remonté) | **Corrigé** : import statique |
| 4 | L'étape `deps` du Dockerfile fait un `prisma generate` perdu et invalide le cache de `npm ci` à chaque modification du schéma | **Non appliqué** : passer à `npm ci --ignore-scripts` demande de reconstruire sur la Pi (≈ 15 min) pour vérifier que Prisma trouve encore ses moteurs ; à reprendre dans `ci-docker-image`, où la CI construit l'image de toute façon |
| — | L'étape `migrate` installe Prisma aux versions du lockfile, mais sans lockfile pour leurs dépendances | Accepté : pas de défaut, seulement une reproductibilité imparfaite |
