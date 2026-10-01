# SPEC-012 — Alertes et durcissement

| | |
|---|---|
| **Statut** | **Validée** le 2026-10-01 |
| **Date** | 2026-10-01 |
| **Phase** | 10 — Observabilité et durcissement |
| **Dépend de** | [SPEC-010](./010-deployment.md) (déploiement, sauvegardes) |

---

## 1. Problème

JobFlow tourne seul sur la Pi. Si l'application s'arrête, si la sauvegarde de la nuit échoue ou si la carte SD se remplit, je ne le saurai qu'en ouvrant l'application, peut-être des semaines plus tard. Et les bibliothèques utilisées vieillissent sans que je voie passer leurs failles.

## 2. Objectif

Être **prévenu sur mon iPhone** quand quelque chose ne va pas, et garder l'application **à jour et protégée** sans effort.

## 3. Périmètre

### Inclus

- Alertes ntfy (appli gratuite) : application injoignable, sauvegarde en échec ou absente, carte SD presque pleine, PC qui n'arrive plus à récupérer les sauvegardes.
- Journaux Docker limités en taille (la carte SD ne se remplit pas de journaux).
- En-têtes de sécurité HTTP.
- Vérification des failles connues dans la CI ; Dependabot une fois par mois, mises à jour regroupées.

### Exclus

| Exclu | Pourquoi |
|---|---|
| Prometheus / Grafana | Lourds pour une Pi de 4 Go et un seul utilisateur (décision du 2026-10-01) |
| Alertes par e-mail ou SMS | ntfy suffit |
| Mise à jour automatique des dépendances sans PR | Chaque mise à jour passe par la CI et une fusion |

## 4. Exigences fonctionnelles

| ID | Exigence |
|---|---|
| FR-012-01 | Toutes les 5 minutes, la Pi vérifie `/api/health` ; au 2ᵉ échec de suite (10 min, pour ne rien déclencher pendant un déploiement), une alerte « JobFlow ne répond plus » ; au retour, « JobFlow répond de nouveau ». Pas de répétition tant que l'état ne change pas. |
| FR-012-02 | Une sauvegarde nocturne en échec envoie une alerte ; une vérification quotidienne alerte si la dernière sauvegarde a plus de 26 h. |
| FR-012-03 | Une vérification quotidienne alerte si la carte SD est remplie à plus de 85 %. |
| FR-012-04 | Le PC alerte s'il n'arrive pas à joindre la Pi pour récupérer les sauvegardes. |
| FR-012-05 | Les journaux des conteneurs de production sont limités (3 fichiers de 10 Mo par conteneur). |
| FR-012-06 | Chaque page porte des en-têtes de sécurité : politique de contenu (CSP) limitant scripts, styles, images et connexions à JobFlow, interdiction d'être affichée dans un autre site, `nosniff`, politique de référent, permissions désactivées (caméra, micro, géolocalisation), HSTS. |
| FR-012-07 | La CI échoue si une dépendance de production a une faille connue de gravité haute ou critique. |
| FR-012-08 | Dependabot propose chaque mois une PR regroupant les mises à jour mineures et correctifs (npm, actions GitHub, images Docker) ; une version majeure arrive dans sa propre PR ; les alertes de sécurité restent immédiates. |

## 5. Règles

- **BR-012-01** — Le canal ntfy a un nom secret et aléatoire (`NTFY_TOPIC`), rangé dans les `.env` de la Pi et du PC, jamais dans le dépôt.
- **BR-012-02** — Une alerte ne contient aucune donnée personnelle (ni candidature, ni profil) : seulement l'événement et la machine.
- **BR-012-03** — Sans `NTFY_TOPIC`, les scripts écrivent l'alerte dans leur journal et continuent : une alerte qui ne part pas ne casse jamais une sauvegarde.
- **BR-012-04** — En développement, la CSP autorise ce dont le rechargement à chaud de Next.js a besoin ; en production, non.

## 6. Critères d'acceptation

| ID | Étant donné | Quand | Alors |
|---|---|---|---|
| AC-012-01 | l'application arrêtée sur la Pi | la vérification passe | une seule alerte « ne répond plus », puis « répond de nouveau » au redémarrage |
| AC-012-02 | une sauvegarde qui échoue | `backup.sh` se termine | une alerte « sauvegarde échouée » |
| AC-012-03 | une page de JobFlow | je regarde ses en-têtes | CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS |
| AC-012-04 | la page en production | je l'utilise (formulaires, pièces jointes, agenda, IA) | rien n'est bloqué par la CSP |
| AC-012-05 | une dépendance avec une faille haute | la CI tourne | elle échoue |
| AC-012-06 | une alerte envoyée | je la lis sur l'iPhone | elle ne contient aucune donnée personnelle |

## 7. Plan de test

| Niveau | Outil | Ce qui est testé | Critères |
|---|---|---|---|
| Unitaire | Vitest | En-têtes de sécurité (production / développement) | AC-012-03 |
| Navigateur | Serveur de production local | Parcours complet sans blocage CSP (console) | AC-012-04 |
| Manuel, sur la Pi | Scripts | Watchdog (arrêt / reprise), sauvegarde en échec, disque | AC-012-01, 02, 06 |
| CI | GitHub Actions | `npm audit --omit=dev --audit-level=high` | AC-012-05 |
