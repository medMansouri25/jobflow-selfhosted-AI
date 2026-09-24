# SPEC-000 — Vision produit

| | |
|---|---|
| **Statut** | Draft — en attente de validation |
| **Date** | 2026-09-24 |
| **Vocabulaire** | `CONTEXT.md` fait foi (glossaire local) |
| **Décisions** | [`docs/adr/`](../docs/adr/) |

---

## 1. Problème

Pendant une recherche d'emploi, j'envoie plusieurs dizaines de **Candidatures**. Au bout de quelques semaines :

- je ne sais plus précisément à quelles **Entreprises** j'ai candidaté, ni pour quel poste ;
- je ne retrouve plus la description de l'**Annonce**, parfois déjà retirée en ligne ;
- je ne sais plus quelle version de mon CV j'ai envoyée ;
- une invitation à un entretien arrive des semaines plus tard et je dois retrouver le contexte en urgence ;
- tout est dispersé entre e-mails, LinkedIn, sites carrières, notes et fichiers ;
- rédiger une lettre de motivation personnalisée et préparer un entretien prend beaucoup de temps.

## 2. Vision

**JobFlow AI** est l'unique endroit où je suis toute ma recherche d'emploi : chaque Candidature, de sa saisie à sa fin, avec son historique complet.

Une fois cette base solide, des fonctionnalités d'IA viendront m'aider à analyser une Annonce, rédiger un brouillon de lettre fidèle à mon parcours et préparer mes entretiens.

## 3. Utilisateur

- **Un seul utilisateur : moi.** Pas de SaaS, pas d'inscription.
- Le modèle de données ne doit pas empêcher un passage futur au multi-utilisateur : chaque entité principale est rattachée à un utilisateur.

## 4. Cycle de vie d'une Candidature

```
BROUILLON → POSTULÉE → ENTRETIEN → ACCEPTÉE   (définitive)
               │           │    ↘ REFUSÉE     (définitive)
               ├──→ REFUSÉE
               └─────┬─────┘
                     ↓   ↑ réouverture
                   CLASSÉE
```

Les définitions exactes de chaque statut sont dans `CONTEXT.md` ; les règles de transition dans [SPEC-001](./001-application-management.md).

## 5. Périmètre

### MVP (Phases 0 à 4)

| Spec | Fonctionnalité |
|---|---|
| 001 | Gestion des Candidatures et des Entreprises |
| 002 | Dashboard |
| 003 | Entretiens et Contacts |
| 004 | Agenda |
| 010 | Déploiement (Raspberry Pi, Tailscale, sauvegardes) |
| 011 | CI/CD |

### Après le MVP

| Spec | Fonctionnalité |
|---|---|
| 005 | Documents (CV, lettres, pièces jointes) |
| 006 | Profil — prérequis de l'IA |
| 007 | IA : analyse d'une Annonce |
| 008 | IA : brouillon de lettre de motivation |
| 009 | IA : préparation d'entretien |
| 012 | Observabilité et durcissement |

### Hors périmètre (décisions explicites)

- Relances / prochaine action.
- Détection des doublons.
- Récupération automatique d'une Annonce depuis son URL (ADR `0002`).
- Exposition publique de l'application et authentification applicative (ADR `0001`).
- Intégration Google Calendar / Outlook.
- Multi-utilisateur.
- Toute promesse d'« indétectabilité » des textes générés par IA.

## 6. Contraintes

| Contrainte | Conséquence |
|---|---|
| Hébergement sur Raspberry Pi à domicile (ARM64, 4 Go RAM) | Images Docker multi-arch construites en CI, jamais sur la Pi |
| Accès uniquement via Tailscale | Aucune surface publique ; pas de login (ADR `0001`) |
| Projet d'apprentissage et vitrine CV | Chaque choix technique est expliqué et documenté ; pas de complexité gratuite |
| Données personnelles (candidatures, salaires, CV) | Aucun secret dans Git ; base sauvegardée hors de la Pi ; fournisseur d'IA choisi en connaissance de cause |

## 7. Stack

Next.js (App Router) · TypeScript · React · Tailwind CSS · PostgreSQL · Prisma (ADR `0003`) · Zod · Vitest · Docker Compose · Caddy · GitHub Actions.

L'hébergement de la base en production (PostgreSQL sur la Pi avec SSD, ou Neon en UE) est tranché en Phase 1.5.

## 8. Principes

1. La spec est la source de vérité fonctionnelle ; un écart avec le code est signalé, jamais corrigé en silence.
2. Simplicité avant complexité : monolithe modulaire, pas de service supplémentaire sans besoin réel.
3. Toute entrée est validée côté serveur.
4. Chaque critère d'acceptation a un identifiant (`AC-NNN-xx`) repris par les tests qui le couvrent.
5. L'IA n'arrive qu'une fois l'application utile sans elle.

## 9. Critères de succès du MVP

- J'utilise JobFlow AI comme **seul** outil de suivi pendant ma recherche d'emploi.
- Pour n'importe quelle Candidature, je retrouve en moins de 30 secondes : l'Entreprise, le poste, la description de l'Annonce, la version du CV envoyée et l'historique des statuts.
- Le dashboard me dit où j'en suis sans calcul manuel.
- L'application tourne sur ma Pi, déployée automatiquement par la CI, avec une sauvegarde dont la restauration a été testée.
