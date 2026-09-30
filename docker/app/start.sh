#!/bin/sh
# Démarrage du conteneur : les migrations d'abord, le serveur ensuite.
# Une migration en échec arrête tout (set -e) : on ne sert jamais une base à moitié migrée (BR-010-05).
set -e

cd /opt/migrate
./node_modules/.bin/prisma migrate deploy

cd /app
exec node server.js
