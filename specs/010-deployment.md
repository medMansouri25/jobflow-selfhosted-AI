# SPEC-010 — Déploiement sur la Raspberry Pi

| | |
|---|---|
| **Statut** | **Validée** le 2026-09-30 |
| **Date** | 2026-09-30 |
| **Phase** | 1.5 — Squelette déployé |
| **Feuille de route** | [`docs/roadmaps/phase-1-5-squelette-deploye/roadmap.md`](../docs/roadmaps/phase-1-5-squelette-deploye/roadmap.md) |
| **Décisions** | [ADR 0001](../docs/adr/0001-acces-prive-tailscale-sans-authentification.md) (Tailscale, sans authentification), [ADR 0006](../docs/adr/0006-pieces-jointes-sur-uploadthing.md) (pièces jointes), [ADR 0007](../docs/adr/0007-base-de-production-sur-la-pi.md) (base de production sur la Pi) |
| **Dépend de** | [SPEC-000](./000-product-vision.md), [SPEC-001](./001-application-management.md) |

---

## 1. Problème

JobFlow ne fonctionne que sur mon PC, quand je lance `npm run dev`. Je ne peux pas l'utiliser depuis mon téléphone, ni quand mon PC est éteint, et mes Candidatures n'existent que dans une base de développement.

## 2. Objectif

Depuis mon téléphone ou mon PC, où que je sois, j'ouvre `https://jobflow.<tailnet>.ts.net` et j'utilise JobFlow « pour de vrai ». L'application tourne en permanence sur la Raspberry Pi, avec une base de production séparée de celle de développement. Chaque nuit, la base est sauvegardée, les sauvegardes arrivent sur mon PC, et je sais restaurer.

## 3. Périmètre

### Inclus

- Image Docker de l'application (ARM64), construite par la CI et publiée sur GHCR à chaque merge sur `main`.
- Installation de production sur la Pi : application, PostgreSQL de production, HTTPS via Tailscale.
- Mise à jour et retour arrière par une commande lancée à la main.
- Sauvegarde nocturne, récupération par le PC, restauration testée.
- Procédure écrite de préparation de la Pi (`docs/runbooks/`).

### Exclus

| Exclu | Où / quand |
|---|---|
| Mise à jour automatique à chaque merge | Plus tard, une fois le déploiement manuel éprouvé |
| SSD USB, copie des sauvegardes en ligne | Plus tard si besoin (ADR 0007) |
| Accès public, authentification applicative | Exclu (ADR 0001) |
| Sauvegarde des PDF | Gérée par UploadThing (ADR 0006) |
| Supervision, alertes | Non prévu |

## 4. User stories

| ID | En tant qu'utilisateur, je veux… | …afin de… |
|---|---|---|
| US-010-01 | ouvrir JobFlow depuis mon téléphone ou mon PC, où que je sois | suivre mes Candidatures sans dépendre de mon PC allumé |
| US-010-02 | que personne d'autre ne puisse ouvrir JobFlow | garder mes données privées sans gérer de mot de passe |
| US-010-03 | installer une nouvelle version en une commande, et revenir en arrière si elle pose problème | choisir le moment d'une mise à jour sans risque |
| US-010-04 | que mes données soient sauvegardées chaque nuit et arrivent sur mon PC | ne pas tout perdre si la carte SD de la Pi lâche |
| US-010-05 | savoir restaurer une sauvegarde | que la sauvegarde serve vraiment le jour où j'en ai besoin |

## 5. Exigences fonctionnelles

| ID | Exigence |
|---|---|
| FR-010-01 | Chaque merge sur `main` produit une image de l'application pour ARM64, publiée sur GHCR et étiquetée par le commit (et `latest`). |
| FR-010-02 | L'application est servie en HTTPS à `https://jobflow.<tailnet>.ts.net`, avec un certificat valide fourni par Tailscale. |
| FR-010-03 | Elle n'est joignable que depuis les appareils du tailnet de l'utilisateur. |
| FR-010-04 | La production utilise sa propre base PostgreSQL, distincte de `jobflow_dev` et `jobflow_test` (conteneur, volume et identifiants propres). Elle démarre vide. |
| FR-010-05 | Au démarrage, l'application applique les migrations Prisma en attente avant d'accepter des requêtes. |
| FR-010-06 | `GET /api/health` répond 200 quand l'application et la base répondent, 503 sinon ; le conteneur s'en sert comme `HEALTHCHECK`. |
| FR-010-07 | `./deploy.sh`, lancé à la main sur la Pi, télécharge la dernière image, redémarre l'application et vérifie qu'elle est en bonne santé. |
| FR-010-08 | `./deploy.sh <version>` réinstalle une version précédente (retour arrière). |
| FR-010-09 | Chaque nuit, la Pi fait une sauvegarde `pg_dump` de la base de production et garde les 7 dernières. |
| FR-010-10 | Une tâche planifiée Windows récupère sur le PC, via Tailscale, les sauvegardes qu'il n'a pas encore, quand le PC est allumé. |
| FR-010-11 | Une procédure écrite permet de restaurer une sauvegarde dans une base vide. |
| FR-010-12 | Une procédure écrite décrit la préparation de la Pi (Tailscale sur la Pi, le PC et le téléphone ; Docker ; commandes `sudo` lancées par l'utilisateur). |

## 6. Règles de fonctionnement

- **BR-010-01** — Les mises à jour sont **manuelles** : aucune version n'arrive en production sans que l'utilisateur lance `./deploy.sh`.
- **BR-010-02** — Une coupure de quelques secondes pendant une mise à jour est acceptable (un seul utilisateur).
- **BR-010-03** — Si l'application n'est pas en bonne santé après une mise à jour, `./deploy.sh` le signale et indique la commande de retour arrière ; il ne revient pas en arrière tout seul.
- **BR-010-04** — Les PDF de production sont stockés dans **la même app UploadThing** que ceux du développement (décision du 2026-09-30) : rien à créer, mais les fichiers de test et les vrais sont au même endroit. Les tests automatisés n'appellent jamais UploadThing (ADR 0006).
- **BR-010-05** — Une migration qui échoue au démarrage empêche l'application de démarrer : on ne sert jamais une base à moitié migrée.

## 7. Critères d'acceptation

| ID | Étant donné | Quand | Alors |
|---|---|---|---|
| AC-010-01 | une PR fusionnée sur `main` | la CI termine | une image ARM64 étiquetée par le commit est disponible sur GHCR |
| AC-010-02 | mon téléphone connecté à Tailscale, en 4G | j'ouvre `https://jobflow.<tailnet>.ts.net` | le tableau de bord s'affiche, sans avertissement de certificat |
| AC-010-03 | un appareil hors du tailnet | il tente de joindre la Pi sur le port de l'application | la connexion échoue |
| AC-010-04 | la production vient d'être installée | j'ouvre la liste des Candidatures | elle est vide ; la Candidature « Sanofi » de développement n'y est pas |
| AC-010-05 | une nouvelle migration dans l'image | je lance `./deploy.sh` | la migration est appliquée, l'application redémarre et `/api/health` répond 200 |
| AC-010-06 | une version déployée qui pose problème | je lance `./deploy.sh <version précédente>` | la version précédente tourne à nouveau et mes données sont intactes |
| AC-010-07 | la base de production injoignable | j'appelle `/api/health` | la réponse est 503 et le conteneur est marqué « unhealthy » |
| AC-010-08 | une nuit passée | je regarde le dossier des sauvegardes sur la Pi | une sauvegarde datée de la nuit existe ; il n'y en a pas plus de 7 |
| AC-010-09 | le PC éteint pendant deux nuits | je l'allume | les sauvegardes manquantes sont copiées sur le PC |
| AC-010-10 | une sauvegarde récupérée sur le PC | je suis la procédure de restauration dans une base vide | les Candidatures, leurs historiques et les références de leurs pièces jointes sont présents |

## 8. Sécurité

- **Accès** : aucun port de l'application n'est ouvert sur Internet ; la box n'est pas modifiée. Seul Tailscale donne accès (ADR 0001).
- **Secrets** : `DATABASE_URL`, le mot de passe PostgreSQL et `UPLOADTHING_TOKEN` vivent dans un fichier `.env` sur la Pi, hors du dépôt, lisible par l'utilisateur seul. L'image Docker n'en contient aucun.
- **Conteneur** : l'application tourne sous un utilisateur non-root.
- **Sauvegardes** : elles contiennent toutes les données ; elles restent sur la Pi et sur le PC, jamais dans le dépôt.
- **Base** : PostgreSQL de production n'écoute pas sur le réseau local ; seule l'application y accède.

## 9. Plan de test

| Niveau | Comment | Critères couverts |
|---|---|---|
| CI | Construction de l'image à chaque PR ; publication à chaque merge | AC-010-01 |
| Intégration | Test de `/api/health` (base joignable / injoignable), à écrire avec le Dockerfile | AC-010-07 |
| Manuel, sur la Pi | Déploiement, retour arrière, accès téléphone en 4G, accès hors tailnet | AC-010-02 à 06 |
| Manuel, une fois | Sauvegarde, récupération par le PC, restauration dans une base vide | AC-010-08 à 10 |

Les vérifications manuelles sont consignées dans le `progress-tracker.md` de la tâche concernée, avec la date.
