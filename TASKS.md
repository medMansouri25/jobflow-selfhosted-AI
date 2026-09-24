# TASKS — JobFlow AI

Liste de toutes les tâches du projet, dans l'ordre d'exécution.
**Une tâche = une branche = une Pull Request.** Rien n'est poussé directement sur `main`.

> Les phases 0 et 1 sont détaillées : leurs specs existent. Les phases suivantes sont listées à gros grain ; chacune commence par l'écriture de sa spec, qui précisera ses tâches.

**Légende** : `[ ]` à faire · `[~]` en cours · `[x]` terminée (PR mergée)

---

## Workflow Git / GitHub pour chaque tâche

### 1. Partir d'un `main` à jour

```bash
git switch main
git pull
```

### 2. Créer la branche de la tâche

```bash
git switch -c feature/spec-001-status-machine
```

| Préfixe | Usage | Exemple |
|---|---|---|
| `feature/spec-NNN-…` | Fonctionnalité d'une spec | `feature/spec-001-create-application` |
| `chore/…` | Outillage, configuration, infrastructure | `chore/ci` |
| `docs/…` | Documentation, specs, ADR | `docs/spec-002-dashboard` |
| `fix/…` | Correction de bug | `fix/company-name-normalization` |

### 3. Travailler par petits commits

```bash
git status                 # voir ce qui a changé
git add <fichiers>         # préparer les fichiers du commit
git commit -m "feat(applications): add status transition rules"
```

Format des messages : `type(portée): description` — types : `feat`, `fix`, `test`, `docs`, `chore`, `refactor`.

### 4. Publier la branche

```bash
git push -u origin feature/spec-001-status-machine   # la première fois
git push                                              # les fois suivantes
```

### 5. Ouvrir la Pull Request sur GitHub

1. Sur le dépôt, bouton **Compare & pull request** (ou onglet *Pull requests* → *New pull request*).
2. Base : `main` ← compare : ta branche.
3. Titre = résumé de la tâche (ex. `SPEC-001 — Machine à états des statuts`).
4. Description : ce qui a été fait, les critères d'acceptation couverts (`AC-001-05…09`), comment tester.
5. Vérifier que la **CI est verte** (à partir de la tâche T0.7).
6. Relire soi-même l'onglet **Files changed** : c'est la revue de code.

### 6. Merger et nettoyer

1. **Squash and merge** : la branche devient un seul commit propre sur `main`.
2. **Delete branch** sur GitHub.
3. En local :

```bash
git switch main
git pull
git branch -d feature/spec-001-status-machine
```

4. Cocher la tâche dans ce fichier (dans la PR suivante, ou directement dans la PR de la tâche).

### Si `main` a avancé pendant que tu travaillais

```bash
git switch main && git pull
git switch feature/ma-branche
git merge main            # résoudre les conflits éventuels, puis commit
git push
```

---

## Phase 0 — Foundation

| # | Tâche | Branche | Dépend de |
|---|---|---|---|
| T0.1 | Revue de SPEC-000 et SPEC-001 | `docs/spec-001-review` | — |
| T0.2 | Protection de `main` et modèle de PR | `chore/github-setup` | — |
| T0.3 | Initialisation Next.js | `chore/project-setup` | T0.2 |
| T0.4 | Mise en place de Vitest | `chore/vitest` | T0.3 |
| T0.5 | PostgreSQL local et configuration | `chore/docker-postgres` | T0.3 |
| T0.6 | Prisma, seed et socle serveur | `chore/prisma-setup` | T0.4, T0.5 |
| T0.7 | CI GitHub Actions | `chore/ci` | T0.6 |
| T0.8 | Socle UI (shadcn/ui, layout) | `chore/ui-foundation` | T0.3 |

### [ ] T0.1 — Revue de SPEC-000 et SPEC-001
- Trancher les hypothèses **H1 à H5** de SPEC-001.
- Passer les deux specs au statut **Validée**.
- **Terminé quand** : aucune hypothèse ouverte ; statut « Validée » dans les deux fichiers.

### [ ] T0.2 — Protection de `main` et modèle de PR
- Sur GitHub : *Settings → Rules → Rulesets* (ou *Branches → Branch protection rules*) pour `main` :
  - exiger une Pull Request avant de merger ;
  - interdire les *force push* et la suppression ;
  - (après T0.7) exiger que la CI passe.
- Ajouter `.github/pull_request_template.md` (résumé, critères d'acceptation couverts, comment tester, checklist Definition of Done).
- **Terminé quand** : un `git push` direct sur `main` est refusé par GitHub.

### [ ] T0.3 — Initialisation Next.js
- `create-next-app` : TypeScript, App Router, Tailwind CSS, ESLint, dossier `src/`, alias `@/*`.
- TypeScript en mode `strict`.
- Scripts npm : `dev`, `build`, `start`, `lint`, `typecheck`.
- Fixer la version de Node (`.nvmrc` + `engines` dans `package.json`).
- Page d'accueil minimale « JobFlow AI ».
- Renseigner les versions dans `docs/architecture/tech-stack.md`.
- **Terminé quand** : `npm run lint`, `npm run typecheck` et `npm run build` passent.

### [ ] T0.4 — Mise en place de Vitest
- Installer et configurer Vitest (+ Testing Library pour les composants).
- Deux projets de test : **unit** (parallèle) et **integration** (en série, base `jobflow_test`).
- Scripts : `test`, `test:unit`, `test:integration`.
- Un premier test trivial pour valider la configuration.
- **Terminé quand** : `npm test` passe.

### [ ] T0.5 — PostgreSQL local et configuration
- `docker-compose.yml` : un service PostgreSQL, un volume nommé, un script d'initialisation créant `jobflow_dev` et `jobflow_test`.
- `.env.example` (sans secret réel).
- `src/lib/env.ts` : validation des variables d'environnement par Zod au démarrage.
- **Terminé quand** : `docker compose up -d` démarre la base ; l'application refuse de démarrer si `DATABASE_URL` manque.

### [ ] T0.6 — Prisma, seed et socle serveur
- Installer Prisma ; `prisma/schema.prisma` avec le modèle `User`.
- Première migration ; `prisma/seed.ts` créant l'utilisateur unique.
- `src/lib/db.ts` (client unique), `src/lib/current-user.ts`, `src/lib/errors.ts` (`DomainError`, `NotFoundError`, conversion en état d'action).
- Utilitaire de test d'intégration : migrations sur `jobflow_test`, tables vidées avant chaque test.
- `src/app/api/health/route.ts` : répond `200` si la base répond.
- **Terminé quand** : un test d'intégration lit l'utilisateur seedé ; `/api/health` répond `200`.

### [ ] T0.7 — CI GitHub Actions
- `.github/workflows/ci.yml` sur chaque Pull Request et chaque push sur `main` :
  - `npm ci`, `lint`, `typecheck`, tests unitaires, tests d'intégration (PostgreSQL en *service container*), `build`.
- Rendre ce check **obligatoire** dans la protection de `main` (T0.2).
- **Terminé quand** : une PR affiche la CI verte, et une PR avec un test cassé ne peut pas être mergée.

### [ ] T0.8 — Socle UI
- Initialiser shadcn/ui ; ajouter Button, Input, Label, Textarea, Select, Badge, Dialog.
- Layout racine : en-tête, navigation (Candidatures), langue `fr`.
- `error.tsx` et `not-found.tsx` globaux.
- **Terminé quand** : la page d'accueil utilise le layout et un composant shadcn/ui.

---

## Phase 1 — Gestion des Candidatures (SPEC-001)

| # | Tâche | Branche | Critères | Dépend de |
|---|---|---|---|---|
| T1.1 | Modèle de données | `feature/spec-001-data-model` | — | T0.6, T0.1 |
| T1.2 | Machine à états des statuts | `feature/spec-001-status-machine` | AC-001-05 à 09 (unitaires) | T1.1 |
| T1.3 | Schémas de validation | `feature/spec-001-validation` | AC-001-02, 03, 04, 17, 18 | T1.1 |
| T1.4 | Créer une Candidature | `feature/spec-001-create-application` | AC-001-01 à 04, 17, 18 | T1.2, T1.3, T0.8 |
| T1.5 | Consulter une Candidature | `feature/spec-001-application-detail` | AC-001-19, 20 | T1.4 |
| T1.6 | Modifier une Candidature | `feature/spec-001-edit-application` | AC-001-11 | T1.5 |
| T1.7 | Changer le statut | `feature/spec-001-status-change` | AC-001-05 à 10 | T1.5 |
| T1.8 | Supprimer une Candidature | `feature/spec-001-delete-application` | AC-001-12, 13 | T1.5 |
| T1.9 | Liste, recherche, filtres, tri | `feature/spec-001-application-list` | AC-001-14, 15, 16, 21 | T1.4 |
| T1.10 | Clôture de SPEC-001 | `docs/spec-001-done` | tous | T1.2 à T1.9 |

### [ ] T1.1 — Modèle de données
- Modèles Prisma `Company`, `Application`, `ApplicationStatusChange` et les énumérations (SPEC-001 §7).
- Unicité `(userId, normalizedName)` ; cascade de `Application` vers son historique.
- Migration.
- **Terminé quand** : la migration s'applique sur une base vide ; le seed passe toujours.

### [ ] T1.2 — Machine à états des statuts
- `modules/applications/domain/status.ts` : `canTransition`, `allowedTransitions`, statuts terminaux, candidatures actives.
- Tests unitaires couvrant **toutes** les transitions autorisées et interdites (BR-001-05).
- **Terminé quand** : AC-001-05 à 09 couverts par des tests unitaires verts.

### [ ] T1.3 — Schémas de validation
- `modules/applications/schemas.ts` : création, modification, changement de statut, filtres de liste.
- Règles : champs obligatoires selon le statut, date non future, salaire, URL `http(s)`, longueurs.
- `modules/companies/domain` : normalisation du nom d'Entreprise.
- **Terminé quand** : AC-001-02, 03, 04, 17, 18 couverts par des tests unitaires verts.

### [ ] T1.4 — Créer une Candidature
- Service : `createApplication` (Entreprise trouvée ou créée, statut initial, entrée d'historique, en transaction).
- Service `companies` : recherche par préfixe pour l'autocomplétion.
- Server Action + page `/applications/new` : formulaire, autocomplétion de l'Entreprise, choix Brouillon / Postulée.
- **Terminé quand** : AC-001-01 à 04, 17, 18 verts ; création possible depuis l'interface.

### [ ] T1.5 — Consulter une Candidature
- Page `/applications/[id]` : champs, Entreprise, description en texte brut, lien externe sécurisé, historique des statuts.
- 404 pour un id inconnu.
- **Terminé quand** : AC-001-19, 20 vérifiés.

### [ ] T1.6 — Modifier une Candidature
- Service `updateApplication` (tous les champs sauf le statut).
- Page `/applications/[id]/edit`, formulaire partagé avec la création.
- **Terminé quand** : AC-001-11 vert.

### [ ] T1.7 — Changer le statut
- Service `changeApplicationStatus` : transition vérifiée sur l'état **en base**, historique en transaction, date de candidature par défaut au passage en Postulée.
- Composant `StatusMenu` : uniquement les transitions autorisées ; confirmation pour Acceptée / Refusée.
- **Terminé quand** : AC-001-05 à 10 verts (y compris requêtes forgées).

### [ ] T1.8 — Supprimer une Candidature
- Service `deleteApplication` (cascade de l'historique, l'Entreprise est conservée).
- Fenêtre de confirmation rappelant l'Entreprise et le poste.
- **Terminé quand** : AC-001-12, 13 vérifiés.

### [ ] T1.9 — Liste, recherche, filtres, tri
- Service `listApplications` : actives par défaut, filtres (statut, actives/terminées/toutes, contrat, source), recherche texte, tri, pagination par 25.
- Page `/applications` ; paramètres de recherche dans l'URL ; état vide.
- **Terminé quand** : AC-001-14, 15, 16, 21 verts.

### [ ] T1.10 — Clôture de SPEC-001
- Vérifier les 21 critères d'acceptation et la Definition of Done.
- Mettre à jour la documentation d'architecture si le code a introduit un nouveau pattern.
- **Terminé quand** : SPEC-001 au statut « Implémentée ».

---

## Phase 1.5 — Squelette déployé (SPEC-010)

| # | Tâche | Branche |
|---|---|---|
| [ ] T1.5.1 | Rédiger SPEC-010 ; trancher **Q6** (PostgreSQL sur la Pi avec SSD, ou Neon) par un ADR | `docs/spec-010-deployment` |
| [ ] T1.5.2 | Dockerfile multi-étapes (sortie `standalone`, utilisateur non-root, `HEALTHCHECK`) | `chore/dockerfile` |
| [ ] T1.5.3 | CI : image multi-arch (`docker buildx`, ARM64) publiée sur GHCR à chaque merge sur `main` | `chore/ci-docker-image` |
| [ ] T1.5.4 | Préparer la Pi : OS, Docker, Tailscale, (SSD) — procédure dans `docs/runbooks/` | `docs/runbook-pi-setup` |
| [ ] T1.5.5 | `docker-compose.prod.yml` + `Caddyfile` (HTTPS `*.ts.net`) + migrations au déploiement | `chore/prod-compose` |
| [ ] T1.5.6 | Déploiement : mise à jour de l'image sur la Pi (procédure manuelle, puis automatisée) | `chore/deploy` |
| [ ] T1.5.7 | Sauvegardes : `pg_dump` planifié, copie hors de la Pi, **restauration testée** | `chore/backups` |

## Phase 2 — Dashboard (SPEC-002)

| # | Tâche | Branche |
|---|---|---|
| [ ] T2.1 | Rédiger SPEC-002 | `docs/spec-002-dashboard` |
| [ ] T2.2 | Compteurs par statut et candidatures actives | `feature/spec-002-counters` |
| [ ] T2.3 | Candidatures récentes | `feature/spec-002-recent-applications` |
| [ ] T2.4 | Statistiques basiques (taux de réponse, candidatures par semaine) | `feature/spec-002-stats` |

## Phase 3 — Entretiens et Contacts (SPEC-003)

| # | Tâche | Branche |
|---|---|---|
| [ ] T3.1 | Rédiger SPEC-003 | `docs/spec-003-interviews` |
| [ ] T3.2 | Modèle `Interview` et `Contact` | `feature/spec-003-data-model` |
| [ ] T3.3 | Ajouter / modifier / supprimer un entretien | `feature/spec-003-interview-crud` |
| [ ] T3.4 | Passage automatique de la Candidature en Entretien | `feature/spec-003-auto-status` |
| [ ] T3.5 | Contacts d'une Entreprise, interlocuteur d'un entretien | `feature/spec-003-contacts` |
| [ ] T3.6 | Prochains entretiens sur le dashboard | `feature/spec-003-dashboard-upcoming` |

## Phase 4 — Agenda (SPEC-004)

| # | Tâche | Branche |
|---|---|---|
| [ ] T4.1 | Rédiger SPEC-004 | `docs/spec-004-calendar` |
| [ ] T4.2 | Vue « prochains entretiens » | `feature/spec-004-upcoming` |
| [ ] T4.3 | Vue semaine | `feature/spec-004-week-view` |
| [ ] T4.4 | Vue mois | `feature/spec-004-month-view` |

## Phase 5 — Documents (SPEC-005)

| # | Tâche | Branche |
|---|---|---|
| [ ] T5.1 | Rédiger SPEC-005 ; ADR sur le stockage des fichiers | `docs/spec-005-documents` |
| [ ] T5.2 | Stockage et téléversement de fichiers | `feature/spec-005-upload` |
| [ ] T5.3 | Rattacher CV et lettre à une Candidature | `feature/spec-005-attach` |

## Phase 6 — Profil (SPEC-006)

| # | Tâche | Branche |
|---|---|---|
| [ ] T6.1 | Rédiger SPEC-006 | `docs/spec-006-profile` |
| [ ] T6.2 | Profil : informations, expériences, projets, compétences, formations | `feature/spec-006-profile` |
| [ ] T6.3 | Exemples de textes personnels | `feature/spec-006-writing-samples` |

## Phase 7 — IA : analyse d'une Annonce (SPEC-007)

| # | Tâche | Branche |
|---|---|---|
| [ ] T7.1 | ADR fournisseur d'IA (**Q7** : coût, confidentialité, API) | `docs/adr-ai-provider` |
| [ ] T7.2 | Rédiger SPEC-007 | `docs/spec-007-ai-job-analysis` |
| [ ] T7.3 | Client IA, protections contre l'injection de prompt, plafond de coût | `feature/spec-007-ai-client` |
| [ ] T7.4 | Analyse d'une Annonce | `feature/spec-007-job-analysis` |

## Phase 8 — IA : brouillon de lettre (SPEC-008)

| # | Tâche | Branche |
|---|---|---|
| [ ] T8.1 | Rédiger SPEC-008 | `docs/spec-008-ai-cover-letter` |
| [ ] T8.2 | Génération et édition d'un brouillon de lettre | `feature/spec-008-cover-letter` |

## Phase 9 — IA : préparation d'entretien (SPEC-009)

| # | Tâche | Branche |
|---|---|---|
| [ ] T9.1 | Rédiger SPEC-009 | `docs/spec-009-ai-interview-prep` |
| [ ] T9.2 | Mode « Préparer mon entretien » | `feature/spec-009-interview-prep` |

## Phase 10 — Observabilité et durcissement (SPEC-012)

| # | Tâche | Branche |
|---|---|---|
| [ ] T10.1 | Rédiger SPEC-012 | `docs/spec-012-observability` |
| [ ] T10.2 | Logs structurés et supervision du healthcheck | `chore/observability-logs` |
| [ ] T10.3 | Métriques (Prometheus / Grafana si justifié) | `chore/observability-metrics` |
| [ ] T10.4 | Durcissement : dépendances, en-têtes de sécurité, revue des sauvegardes | `chore/hardening` |
