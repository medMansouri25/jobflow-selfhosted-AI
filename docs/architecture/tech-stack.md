# Tech stack

> Les versions exactes sont renseignées à l'installation (Phase 0) et mises à jour à chaque montée de version.

## Vue d'ensemble

```
Appareil (réseau Tailscale) → Caddy (HTTPS, *.ts.net) → Next.js → Prisma → PostgreSQL
```

Monolithe modulaire : une application, un conteneur, une base (ADR `0004`).

## Stack

| Domaine | Choix | Version | Justification |
|---|---|---|---|
| Runtime | Node.js (LTS) | à renseigner | Requis par Next.js |
| Framework | Next.js, App Router | à renseigner | Server Components + Server Actions : un seul projet pour l'UI et le serveur |
| Langage | TypeScript (mode `strict`) | à renseigner | Type safety de la base à l'UI |
| UI | React, Tailwind CSS, shadcn/ui (Radix UI) | à renseigner | Composants accessibles dont le code source est dans le dépôt |
| Validation | Zod | à renseigner | Schémas partagés, validation côté serveur |
| ORM | Prisma | à renseigner | ADR `0003` |
| Base de données | PostgreSQL | à renseigner | Hébergement en production tranché en Phase 1.5 (Pi + SSD ou Neon UE) |
| Tests | Vitest (+ Testing Library pour les composants) | à renseigner | Rapide, compatible TypeScript / ESM sans configuration lourde |
| Gestionnaire de paquets | npm | à renseigner | Voir « Environnement de développement » |
| Conteneurs | Docker, Docker Compose | — | Base de dev/test ; image de production multi-arch |
| Reverse proxy | Caddy | — | HTTPS automatique, certificat `*.ts.net` via Tailscale |
| Accès réseau | Tailscale | — | ADR `0001` |
| CI/CD | GitHub Actions, images publiées sur GHCR | — | Build ARM64 en CI, jamais sur la Pi |

## Points d'entrée

| Point d'entrée | Rôle |
|---|---|
| `src/app/` | Routes et pages Next.js |
| `src/app/api/health/route.ts` | Healthcheck (Docker, Caddy, supervision) |
| `prisma/schema.prisma` | Modèle de données |
| `prisma/seed.ts` | Création de l'utilisateur unique |

## Environnement de développement

Le projet vit sur un disque externe **exFAT** (`E:`). Choix assumé ; conséquences :

- **npm** : pnpm est exclu, exFAT ne supportant pas les liens symboliques.
- **Next.js tourne nativement sous Windows** (`npm run dev`). Seul **PostgreSQL** tourne dans Docker, avec ses données dans un volume géré par Docker. Le code n'est jamais monté dans un conteneur en développement.
- Git exige une exception `safe.directory` pour ce dossier (exFAT n'enregistre pas le propriétaire des fichiers).
- `.gitattributes` impose des fins de ligne LF : le code s'exécute dans des conteneurs Linux.

## Bases de données locales

Un seul conteneur PostgreSQL (Docker Compose) héberge deux bases :

| Base | Usage |
|---|---|
| `jobflow_dev` | Développement (`npm run dev`) |
| `jobflow_test` | Tests d'intégration |

## Stratégie de test

| Niveau | Cible | Base | Exécution |
|---|---|---|---|
| Unitaire | Domaine pur (`modules/*/domain`), schémas Zod | aucune | En parallèle |
| Intégration | Services (`modules/*/service.ts`) | `jobflow_test`, migrations appliquées, tables vidées avant chaque test | **En série** (une seule base partagée) |
| Composant | Composants React critiques | aucune | En parallèle |
| End-to-end | Parcours complets (Playwright) | — | Pas avant la fin du MVP |

- Chaque test cite l'identifiant du critère d'acceptation qu'il couvre (`AC-001-06`).
- En CI, PostgreSQL est fourni par un *service container* GitHub Actions ; même principe qu'en local.

## Configuration

- Toute la configuration passe par des variables d'environnement, **validées au démarrage** par Zod (`src/lib/env.ts`) : l'application refuse de démarrer si une variable manque ou est invalide.
- `.env` n'est jamais commité ; `.env.example` (sans valeur réelle) l'est.

## Contraintes

- Cible **ARM64** (Raspberry Pi, 4 Go de RAM) : image Docker multi-arch construite en CI ; `next build` n'est jamais exécuté sur la Pi.
- Aucune exposition publique (ADR `0001`).
- Aucun secret dans Git.

## Services externes

Aucun en Phase 1. Plus tard : fournisseur d'IA (Phase 7, choix par ADR) et, selon la décision de la Phase 1.5, Neon.
