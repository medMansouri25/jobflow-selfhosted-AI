# JobFlow AI — self-hosted

Application web personnelle pour **centraliser et suivre toute une recherche d'emploi** : chaque candidature, de sa saisie à sa réponse finale, avec son historique complet. Des fonctionnalités d'IA (analyse d'annonce, brouillon de lettre de motivation, préparation d'entretien) viendront ensuite s'appuyer sur cette base.

Projet personnel mené comme un projet professionnel : **Spec-Driven Development**, TDD, décisions d'architecture documentées, CI/CD et auto-hébergement sur Raspberry Pi.

> **Statut : Phase 0 — conception.** La vision produit, le vocabulaire du domaine et la première spec sont rédigés ; le code n'a pas encore commencé.

---

## Pourquoi

Après quelques semaines de candidatures, on ne sait plus à quelles entreprises on a postulé, pour quel poste, avec quelle version de CV — et l'annonce d'origine a souvent disparu quand l'entretien arrive. JobFlow AI réunit tout au même endroit.

## Fonctionnalités prévues

| Phase | Fonctionnalité | Spec |
|---|---|---|
| 1 | Gestion des candidatures et des entreprises, cycle de vie des statuts, historique | [001](specs/001-application-management.md) |
| 1.5 | Déploiement sur la Raspberry Pi, accès Tailscale, sauvegardes | 010 |
| 2 | Dashboard | 002 |
| 3 | Entretiens et contacts | 003 |
| 4 | Agenda | 004 |
| 5–6 | Documents, profil | 005, 006 |
| 7–9 | IA : analyse d'annonce, lettre de motivation, préparation d'entretien | 007–009 |
| 10 | Observabilité et durcissement | 012 |

Cycle de vie d'une candidature :

```
BROUILLON → POSTULÉE → ENTRETIEN → ACCEPTÉE
               │           │    ↘ REFUSÉE
               └─────┬─────┘
                     ↓   ↑ réouverture
                   CLASSÉE
```

## Stack

| Couche | Choix |
|---|---|
| Application | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Données | PostgreSQL, Prisma, Zod |
| Tests | Vitest |
| Infrastructure | Docker, Docker Compose, Caddy |
| Hébergement | Raspberry Pi (ARM64) à domicile, accès privé via Tailscale |
| CI/CD | GitHub Actions — images multi-arch construites en CI, jamais sur la Pi |

## Architecture

```
Appareil (réseau Tailscale) → Caddy (HTTPS) → Next.js → Prisma → PostgreSQL
```

Un monolithe modulaire, volontairement simple : pas de microservices ni d'infrastructure ajoutée sans besoin réel.

## Documentation

| Document | Rôle |
|---|---|
| [`specs/`](specs/) | Le **quoi** : specs fonctionnelles, critères d'acceptation numérotés |
| [`docs/adr/`](docs/adr/) | Les décisions d'architecture et leur justification |
| [`SpecDrivenDevelopment.md`](SpecDrivenDevelopment.md) | Cadrage complet du projet et méthode de travail |

## Méthode

Chaque fonctionnalité suit le même chemin : **clarification du domaine → spec → revue → découpage en missions → implémentation en TDD (red-green-refactor) → revue → documentation**. Chaque critère d'acceptation porte un identifiant (`AC-001-06`) repris par le test qui le couvre.

Le workflow s'appuie sur l'AB Method.
