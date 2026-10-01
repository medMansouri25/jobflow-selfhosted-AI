# Image de production de JobFlow (SPEC-010) : serveur Next.js « standalone », migrations au démarrage.

FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# OpenSSL : le moteur de migration de Prisma en a besoin (absent de l'image slim).
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# Dépendances complètes, pour construire.
FROM base AS deps
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN npm ci

# Construction. Le module `db` est évalué pendant `next build` : une URL factice suffit, aucune connexion n'est ouverte.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN npx prisma generate && npm run build && mkdir -p public

# CLI Prisma seule, pour `prisma migrate deploy` au démarrage (le serveur standalone ne l'embarque pas).
FROM base AS migrate
WORKDIR /opt/migrate
COPY package.json /tmp/app-package.json
COPY package-lock.json ./
# Mêmes `overrides` que l'application : les dépendances corrigées de Prisma (SPEC-012) valent aussi ici.
RUN npm init -y >/dev/null \
  && node -e "const fs=require('fs');const p=require('./package.json');p.overrides=require('/tmp/app-package.json').overrides;fs.writeFileSync('package.json',JSON.stringify(p))" \
  && npm install --no-audit --no-fund \
    "prisma@$(node -p "require('./package-lock.json').packages['node_modules/prisma'].version")" \
    "dotenv@$(node -p "require('./package-lock.json').packages['node_modules/dotenv'].version")"

FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=migrate /opt/migrate/node_modules /opt/migrate/node_modules
COPY prisma.config.ts /opt/migrate/
COPY prisma/schema.prisma /opt/migrate/prisma/schema.prisma
COPY prisma/migrations /opt/migrate/prisma/migrations

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Seul dossier où le serveur écrit (cache de Next.js).
RUN mkdir -p .next/cache && chown node:node .next/cache

COPY docker/app/start.sh /usr/local/bin/start.sh
RUN chmod 755 /usr/local/bin/start.sh

# Jamais root : l'utilisateur `node` est fourni par l'image officielle.
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]

CMD ["start.sh"]
