-- JobFlow est mono-utilisateur (ADR 0001) : l'utilisateur unique est créé avec le schéma,
-- pour qu'une base de production vide (ADR 0007) fonctionne sans lancer le seed.
INSERT INTO "User" ("id")
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM "User");
