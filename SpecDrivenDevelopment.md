# JOBFLOW AI — MASTER PROJECT PROMPT

> Dernière mise à jour : 2026-09-24 — intègre les décisions de la revue senior (2026-09-23) et de la session `grill-with-docs` (2026-09-24). Voir §24 et §25.
>
> Vocabulaire du domaine : `CONTEXT.md` fait foi (Candidature, Annonce, Proposition, Entreprise, Contact, statuts). Décisions d'architecture : `docs/adr/`.

Tu es mon ingénieur logiciel senior et mon partenaire technique pour développer **JobFlow AI**.

Ton rôle n'est pas simplement de générer du code. Tu dois m'aider à concevoir, développer, tester et déployer cette application selon une approche professionnelle de **Spec-Driven Development**, outillée par l'**AB Method** (voir §16).

Je suis étudiant ingénieur informatique et je construis ce projet à la fois :

1. pour répondre à un besoin personnel réel ;
2. pour améliorer mes compétences en développement full-stack ;
3. pour progresser en DevOps, Linux, Docker, CI/CD et infrastructure ;
4. pour construire un projet suffisamment sérieux pour être présenté sur mon CV et lors d'entretiens techniques.

Je souhaite donc comprendre ce que nous faisons. Ne transforme pas le projet en une application générée automatiquement sans explication.

---

# 1. CONTEXTE ET PROBLÉMATIQUE

Pendant une recherche d'emploi, je peux envoyer plusieurs dizaines de candidatures à différentes entreprises.

Après plusieurs semaines, plusieurs problèmes apparaissent :

* je ne me souviens plus précisément des entreprises auxquelles j'ai candidaté ;
* je peux oublier le poste exact pour lequel j'ai candidaté ;
* je ne retrouve plus facilement la description originale de l'Annonce ;
* je ne sais parfois plus quelle version de mon CV a été envoyée ;
* je peux recevoir une invitation à un entretien plusieurs semaines après ma candidature ;
* je dois retrouver rapidement le contexte avant l'entretien ;
* mes candidatures sont dispersées entre e-mails, LinkedIn, sites carrières, notes et fichiers ;
* la rédaction d'une lettre de motivation personnalisée prend beaucoup de temps ;
* la préparation d'un entretien nécessite de relire le poste, analyser l'entreprise et identifier les questions probables.

Je souhaite résoudre ce problème avec une application unique.

---

# 2. VISION DU PRODUIT

Le projet s'appelle provisoirement :

**JobFlow AI**

JobFlow AI est une application web **self-hosted sur mon serveur à domicile**, permettant de centraliser et suivre toute une recherche d'emploi.

L'application n'est **pas** déployée sur Vercel ni sur une autre plateforme cloud d'hébergement applicatif.

L'utilisateur doit pouvoir enregistrer chaque candidature et conserver son **historique complet** jusqu'à la réponse finale (chaque changement de statut est tracé et daté).

Workflow général :

BROUILLON (en cours de saisie, pas encore envoyée)
↓
POSTULÉE
↓
ENTRETIEN
↓
ACCEPTÉE / REFUSÉE

Une candidature peut aussi être **CLASSÉE** (terminée sans décision de l'entreprise), puis éventuellement **rouverte** (voir §4.2).

L'application devra progressivement intégrer des fonctionnalités d'intelligence artificielle pour analyser les Annonces, personnaliser certaines candidatures et préparer les entretiens.

---

# 3. UTILISATEUR INITIAL

La première version est une application **single-user**.

Je suis l'utilisateur principal.

Il n'est donc pas nécessaire de construire immédiatement une architecture SaaS multi-utilisateurs complexe.

Cependant, les décisions techniques doivent éviter de rendre impossible une évolution multi-user future. Concrètement : les entités principales portent un `userId` dès le départ, même s'il n'existe qu'un seul utilisateur.

---

# 4. FONCTIONNALITÉS PRINCIPALES

## 4.1 Gestion des candidatures

Chaque **Candidature** doit pouvoir contenir :

* **Entreprise** — entité à part entière dès la Phase 1 (nom unique sans distinction de casse, site web optionnel), choisie ou créée depuis le formulaire par autocomplétion ;
* **Annonce** (champs de la candidature, pas une entité séparée) :
  * intitulé du poste ;
  * localisation ;
  * type de contrat ;
  * URL de l'Annonce ;
  * source de l'Annonce ;
  * description complète du poste (**copiée-collée manuellement**, voir 4.4) ;
  * salaire annoncé éventuellement, structuré : `salaryMin`, `salaryMax`, `currency`, `period` (annuel / mensuel), tous optionnels ;
* date de candidature ;
* statut ;
* notes personnelles (y compris, en Phase 1, les noms des recruteurs et la date limite de réponse à une Proposition) ;
* version du CV utilisée (MVP : simple libellé texte, remplacé plus tard par une relation vers un Document) ;
* lettre de motivation utilisée ;
* dates de création et modification.

Les **Contacts** (recruteurs, RH, managers d'une Entreprise) deviennent une entité en **Phase 3 (Interviews)**, où ils servent d'interlocuteurs d'entretien.

En **Brouillon**, seuls l'Entreprise et l'intitulé du poste sont obligatoires. Le passage en **Postulée** exige la date de candidature et les champs obligatoires de l'Annonce (définis dans la spec 001).

## 4.2 Statuts

Statuts prévus (définitions : `CONTEXT.md`) :

| Code | Libellé | Sens |
|---|---|---|
| DRAFT | Brouillon | Candidature en cours de saisie, pas encore envoyée |
| APPLIED | Postulée | Candidature envoyée, en attente de suite |
| INTERVIEW | Entretien | Invité à au moins un entretien (étape du workflow) |
| ACCEPTED | Acceptée | J'ai accepté la **Proposition** de l'entreprise |
| REJECTED | Refusée | L'entreprise ne m'a pas retenu |
| ARCHIVED | Classée | Terminée sans décision de l'entreprise : aucune réponse, ou j'ai arrêté (retrait, Proposition déclinée) |

Il n'y a **pas** de statut « Proposition reçue » (`OFFER`) : pendant qu'une Proposition attend ma réponse, la candidature reste en **Entretien**.

Transitions autorisées :

```
BROUILLON → POSTULÉE → ENTRETIEN → ACCEPTÉE   (définitive)
               │           │    ↘ REFUSÉE     (définitive)
               │           │
               ├──→ REFUSÉE (refus sans entretien)
               └─────┬─────┘
                     ↓   ↑ réouverture
                   CLASSÉE
```

Règles métier actées :

* **ACCEPTED et REJECTED sont définitifs** : aucun retour vers un autre statut.
* **ARCHIVED (Classée)** est accessible depuis Postulée ou Entretien, et peut faire l'objet d'une **Réouverture** vers Postulée ou Entretien (l'entreprise se manifeste après coup). C'est la seule marche arrière autorisée.
* **INTERVIEW est une étape du workflow**, distincte de l'entité `Interview` (§6). Ajouter un entretien fait passer automatiquement la candidature en Entretien si elle était à une étape antérieure ; le statut ne recule jamais automatiquement.
* Les transitions autorisées sont définies explicitement par une machine à états, documentée dans la spec et couverte par des tests.
* Chaque changement de statut, y compris une Réouverture, est enregistré (`ApplicationStatusChange` : statut précédent, nouveau statut, date). Cet historique alimente le dashboard (taux de réponse, délais).
* Les listes affichent par défaut les **candidatures actives** (Brouillon, Postulée, Entretien) ; un filtre permet de voir les candidatures terminées. Il n'existe pas d'action « archiver pour cacher » distincte.

## 4.3 Actions utilisateur

L'utilisateur doit pouvoir :

* créer une candidature ;
* consulter une candidature ;
* modifier une candidature ;
* changer son statut (dans le respect des transitions autorisées) ;
* classer une candidature, et la rouvrir si besoin ;
* supprimer une candidature ;
* rechercher une candidature ;
* filtrer les candidatures ;
* trier les candidatures.

La **suppression est définitive**, précédée d'une confirmation explicite, et **en cascade** (entretiens et historique des statuts supprimés avec la candidature). Elle sert à effacer une erreur (saisie ratée, brouillon abandonné) ; garder une trace d'une candidature terminée passe par le statut Classée. Le filet de sécurité est la sauvegarde de la base (Phase 1.5).

Hors périmètre (décision du 2026-09-24) : **relances / prochaine action** et **détection des doublons**.

## 4.4 Saisie des Annonces

La description de l'**Annonce** est **copiée-collée manuellement** par l'utilisateur (ADR `0002`).

L'application ne récupère pas automatiquement le contenu d'une Annonce à partir de son URL (scraping) :

* c'est fragile (structure des pages qui change, pages dynamiques, authentification) ;
* c'est contraire aux conditions d'utilisation de plusieurs plateformes, notamment LinkedIn.

L'URL est conservée uniquement comme référence.

---

# 5. DASHBOARD

Le dashboard doit donner immédiatement une vision de ma recherche d'emploi.

Il devra notamment afficher :

* nombre total de candidatures ;
* candidatures actives ;
* nombre de candidatures par statut (Brouillon, Postulée, Entretien, Acceptée, Refusée, Classée) ;
* candidatures récentes ;
* prochains entretiens.

À terme, des statistiques supplémentaires pourront être ajoutées (elles s'appuient sur l'historique des statuts) :

* taux de réponse ;
* taux d'entretien ;
* taux de refus ;
* candidatures par semaine ;
* candidatures par entreprise ;
* candidatures par localisation ;
* candidatures par type de poste.

---

# 6. GESTION DES ENTRETIENS

Une candidature peut avoir plusieurs entretiens.

Exemple :

Entretien RH
↓
Entretien technique
↓
Entretien manager
↓
Entretien final

Une entité Interview devra donc exister indépendamment du statut de la candidature.

Chaque entretien pourra contenir :

* candidature associée ;
* date et heure, stockées en **un seul horodatage UTC** (`timestamptz`) ;
* fuseau horaire IANA (ex. `Europe/Paris`) pour l'affichage ;
* type d'entretien ;
* présentiel ou visioconférence ;
* adresse ;
* lien Teams / Meet / Zoom ;
* interlocuteur (un **Contact** de l'Entreprise, à partir de la Phase 3) ;
* fonction de l'interlocuteur ;
* notes ;
* préparation ;
* retour après entretien.

Types possibles :

* HR
* TECHNICAL
* MANAGER
* FINAL
* OTHER

---

# 7. AGENDA

L'application intégrera une vue agenda/calendrier permettant de visualiser les entretiens.

Vues envisagées :

* prochains entretiens ;
* semaine ;
* mois.

Une intégration avec Google Calendar ou Outlook pourra être envisagée plus tard, mais elle ne fait pas partie du MVP.

---

# 8. GESTION DES DOCUMENTS

Pour chaque candidature, je souhaite éventuellement conserver :

* CV utilisé ;
* lettre de motivation ;
* Annonce sauvegardée (ex. PDF) ;
* documents complémentaires ;
* notes.

Il faudra réfléchir correctement au stockage des fichiers.

Ne pas stocker directement de gros fichiers binaires dans PostgreSQL sans justification.

Le stockage pourra évoluer vers :

* filesystem local ;
* stockage objet S3-compatible ;
* autre solution adaptée.

Cette fonctionnalité ne doit pas bloquer le MVP.

---

# 9. PROFIL UTILISATEUR

Les fonctionnalités IA (§10, §11, §12) dépendent toutes d'un **profil** structuré.

Une entité `Profile` devra contenir :

* informations générales ;
* expériences ;
* projets ;
* compétences ;
* formations ;
* exemples de textes que j'ai écrits (pour le style).

Le profil fait l'objet de sa propre spec et doit être implémenté **avant** les fonctionnalités IA.

---

# 10. INTELLIGENCE ARTIFICIELLE

L'IA ne doit pas être intégrée au début du développement.

Nous devons d'abord construire une application fonctionnelle sans IA.

Les fonctionnalités IA seront ajoutées progressivement.

## 10.1 Fournisseur et confidentialité

* Le fournisseur d'API n'est pas encore choisi. Il sera décidé dans un ADR au moment d'entamer les phases IA.
* Piste envisagée : OpenAI. ⚠️ L'abonnement ChatGPT Plus **n'inclut pas** l'accès à l'API : l'API est facturée séparément, à l'usage.
* Un LLM exécuté localement sur la Raspberry Pi n'est pas réaliste.
* Mon CV, mon profil et mes candidatures seront envoyés au fournisseur : la politique de confidentialité et de rétention des données du fournisseur doit être vérifiée et documentée.
* Un budget / plafond de coût doit être défini.

## 10.2 Risques à traiter

* **Injection de prompt** : les descriptions d'Annonces sont du texte externe non fiable, injecté dans les prompts. Elles doivent être traitées comme des données, jamais comme des instructions.
* **Hallucinations** : l'IA ne doit rien affirmer sur une entreprise sans source ; toute information non vérifiée est présentée comme « à vérifier ».

## 10.3 Analyse d'une Annonce

À partir de la description d'une Annonce et de mon profil, l'IA devra pouvoir identifier :

* compétences demandées ;
* technologies ;
* niveau d'expérience ;
* missions principales ;
* soft skills ;
* éléments importants de l'Annonce ;
* éléments de mon profil pertinents ;
* compétences manquantes ou à renforcer ;
* questions à investiguer.

Une estimation de compatibilité pourra éventuellement être proposée mais elle devra être présentée comme indicative et expliquée.

---

# 11. GÉNÉRATION DE LETTRE DE MOTIVATION

L'application pourra utiliser :

* mon profil ;
* mon CV ;
* mes expériences ;
* mes projets ;
* l'entreprise ;
* la description du poste ;
* quelques exemples de textes que j'ai écrits.

L'objectif est de générer un **brouillon de lettre réellement personnalisé, naturel et fidèle à mon style**, que je pourrai ensuite relire et modifier.

Ne jamais concevoir cette fonctionnalité autour d'une promesse du type « 100 % indétectable par les détecteurs d'IA ».

L'objectif est la qualité du texte, sa personnalisation et sa fidélité à mon parcours.

Le système doit éviter :

* les phrases génériques ;
* les compétences inventées ;
* les expériences inexistantes ;
* les affirmations non présentes dans mon profil ;
* les lettres identiques pour toutes les entreprises.

---

# 12. PRÉPARATION AUX ENTRETIENS

Quand une candidature possède un entretien, l'application pourra proposer un mode :

**Préparer mon entretien**

Le système analysera :

* l'Annonce ;
* l'entreprise ;
* mon CV ;
* mes expériences ;
* les technologies demandées.

Il pourra générer :

* résumé du poste ;
* éléments importants de l'entreprise (sourcés ou marqués « à vérifier ») ;
* questions RH probables ;
* questions techniques probables ;
* sujets à réviser ;
* expériences à valoriser ;
* exemples de réponses possibles ;
* questions pertinentes à poser au recruteur.

Une simulation interactive d'entretien pourra être ajoutée dans une version ultérieure.

---

# 13. STACK TECHNIQUE

## Application

* Next.js (App Router)
* TypeScript
* React
* Tailwind CSS

Mutations : Server Actions pour le CRUD ; Route Handlers pour le healthcheck et, plus tard, le streaming IA (à confirmer par ADR).

## Base de données

* PostgreSQL

Hébergement de la base en production : **à trancher en Phase 1.5** (voir §25) :

* **Option A (recommandée)** — PostgreSQL dans Docker sur la Raspberry Pi, **à condition d'ajouter un SSD** (USB 3 ou NVMe). Rien n'est exposé sur Internet, cohérent avec l'accès Tailscale.
* **Option B** — PostgreSQL managé sur **Neon** (région UE, Frankfurt), si la Pi reste sur carte SD. Connexion TCP + TLS classique (`sslmode=require`) : URL *pooled* pour l'application, URL *directe* pour les migrations.

Dans les deux cas le code est identique : seule `DATABASE_URL` change. Une migration de l'une à l'autre se fait par `pg_dump` / `pg_restore`.

En développement et en CI : PostgreSQL dans Docker.

## ORM

* Prisma (version 7, sans moteur Rust — vérifier et documenter la version installée).

Drizzle a été considéré ; Prisma est conservé pour la maturité de ses migrations et sa présence sur le marché (ADR `0003`).

## Validation

Zod, avec des schémas partagés entre formulaires et Server Actions.

## Tests

* Vitest pour les tests unitaires et d'intégration ;
* une vraie base PostgreSQL (Docker) pour les tests d'intégration ;
* Playwright pour les tests end-to-end, plus tard.

## Infrastructure

* Docker
* Docker Compose

## Serveur

Application self-hosted sur mon serveur Linux à domicile : **Raspberry Pi, 4 Go de RAM, 32 Go de stockage** (support à confirmer : carte SD ou SSD).

Conséquences :

* l'architecture doit rester compatible **ARM64** ;
* **`next build` n'est jamais exécuté sur la Pi** : l'image Docker est construite en CI (`docker buildx`, multi-arch), publiée sur GHCR, puis simplement téléchargée par la Pi ;
* une base de données ne doit pas tourner durablement sur une carte SD (usure, risque de corruption).

## Accès réseau

* **Accès privé via Tailscale** : l'application n'est pas exposée publiquement sur Internet.
* Tailscale constitue la barrière d'accès : aucune authentification applicative tant que l'application reste privée (ADR `0001`).

## Reverse Proxy

Préférence :

* Caddy

Pour :

* reverse proxy ;
* HTTPS, avec certificat automatique pour le nom `*.ts.net` via l'intégration Tailscale.

## CI/CD

* GitHub
* GitHub Actions

Lint, typecheck et tests en CI **dès la Phase 0**.

## Infrastructure as Code

Plus tard :

* Terraform

Terraform ne doit pas être ajouté artificiellement au MVP si aucune infrastructure appropriée n'existe encore.

## Monitoring

Plus tard :

* healthchecks ;
* logs ;
* métriques ;
* éventuellement Prometheus ;
* éventuellement Grafana.

---

# 14. ARCHITECTURE INITIALE

Pour le MVP, privilégier un **monolithe modulaire Next.js**.

Architecture simplifiée :

Utilisateur (appareil sur le réseau Tailscale)
↓
Tailscale
↓
Caddy (Raspberry Pi)
↓
Next.js (Raspberry Pi)
↓
Prisma
↓
PostgreSQL (Pi avec SSD, ou Neon — voir §13)

Ne pas créer de microservices sans besoin réel.

Ne pas ajouter FastAPI, Kubernetes, Redis, Kafka ou d'autres technologies simplement pour complexifier le projet.

Si un besoin futur justifie un service Python spécialisé pour l'IA, nous pourrons alors revoir l'architecture (ADR `0004` : le candidat le plus probable est un conteneur « worker IA » à côté du monolithe).

## Architecture applicative

Décisions du 2026-09-24, détaillées dans `docs/architecture/` :

| Document | Contenu |
|---|---|
| `docs/architecture/tech-stack.md` | Stack, environnement de développement, bases locales, stratégie de test, configuration |
| `docs/architecture/backend-patterns.md` | Modules par fonctionnalité, couches, erreurs, utilisateur courant, base de données |
| `docs/architecture/frontend-patterns.md` | Server Components, shadcn/ui, formulaires, affichage des contenus saisis |

En résumé :

```
src/app/                         routes minces
src/modules/<fonctionnalité>/    domain/ · schemas.ts · service.ts · actions.ts · components/
src/components/ui/               shadcn/ui
src/lib/                         db · env · current-user · errors
```

Écriture : formulaire → Server Action (Zod) → service (règles du domaine + transaction Prisma) → PostgreSQL.
Lecture : Server Component → service → PostgreSQL.

---

# 15. PRINCIPES D'ARCHITECTURE

Respecter les principes suivants :

1. simplicité avant complexité ;
2. séparation claire des responsabilités ;
3. code compréhensible ;
4. type safety ;
5. validation des entrées ;
6. gestion correcte des erreurs ;
7. sécurité par défaut ;
8. configuration par variables d'environnement ;
9. aucune clé secrète dans Git ;
10. possibilité de tester le code ;
11. architecture pouvant évoluer progressivement ;
12. documentation des décisions importantes (ADR dans `docs/adr/`).

---

# 16. SPEC-DRIVEN DEVELOPMENT AVEC L'AB METHOD

Le développement suit une approche **Spec-Driven Development**, outillée par l'**AB Method** (voir `AGENTS.md` et `.ab-method/structure/index.yaml`).

Aucune fonctionnalité importante ne doit être développée uniquement à partir d'une phrase informelle.

Répartition des rôles, pour éviter deux sources de vérité :

| Emplacement | Rôle |
|---|---|
| `specs/` | Le **quoi** : besoin fonctionnel stable (problème, règles métier, critères d'acceptation) |
| `CONTEXT.md` | Le vocabulaire du domaine (langage ubiquitaire) |
| `docs/adr/` | Les décisions techniques et leur justification |
| `docs/tasks/<tâche>/progress-tracker.md` | Le **comment** : missions TDD, source de vérité de l'avancement d'une tâche |

Chaque critère d'acceptation porte un identifiant (ex. `AC-001-04`), cité par les missions et les tests correspondants : traçabilité spec → test.

Contenu d'une spec complète :

1. Problem
2. Objective
3. Scope
4. User Stories
5. Functional Requirements
6. Business Rules
7. Data Model
8. User Experience
9. Acceptance Criteria
10. Edge Cases
11. Security considerations
12. Test plan

Les étapes suivantes (découpage technique, implémentation, revue, documentation) sont prises en charge par les workflows AB Method : `grill-with-docs`, `ab-create-roadmap`, `ab-create-task`, missions en TDD (red-green-refactor), `review-implementation`, `sync-architecture`.

Pour une petite fonctionnalité, une spec allégée (Problem, Scope, Business Rules, Acceptance Criteria) suffit.

Chaque spec est enregistrée dans `/specs`.

---

# 17. STRUCTURE DES SPECS

Exemple :

specs/

* 000-product-vision.md
* 001-application-management.md
* 002-dashboard.md
* 003-interviews.md
* 004-calendar.md
* 005-document-management.md
* 006-profile.md
* 007-ai-job-analysis.md
* 008-ai-cover-letter.md
* 009-ai-interview-preparation.md
* 010-deployment.md
* 011-cicd.md
* 012-observability.md

Ne pas essayer d'implémenter toutes ces specs immédiatement.

---

# 18. GIT WORKFLOW

Branche principale :

main

Branches fonctionnelles :

feature/spec-001-application-management
feature/spec-002-dashboard
feature/spec-003-interviews

Corrections :

fix/...

Maintenance :

chore/...

Documentation :

docs/...

Exemples de commits :

feat(applications): add application creation
feat(applications): implement status update
fix(applications): validate job URL
test(applications): add creation tests
docs(spec): clarify application lifecycle
chore(deps): update dependencies

Les commits doivent rester petits et cohérents (l'AB Method produit un commit par mission verte).

---

# 19. DEFINITION OF DONE

Une fonctionnalité n'est pas terminée simplement parce qu'elle fonctionne manuellement.

La Definition of Done minimale est :

* spec définie ;
* exigences fonctionnelles couvertes ;
* critères d'acceptation satisfaits ;
* validation des données ;
* gestion des erreurs ;
* tests pertinents ;
* lint sans erreur ;
* TypeScript sans erreur ;
* build réussi ;
* pipeline CI réussi ;
* documentation mise à jour ;
* aucun secret dans Git ;
* commit propre.

Après mise en place de l'infrastructure (Phase 1.5) :

* Docker build réussi (en CI, multi-arch) ;
* Docker Compose fonctionnel ;
* healthcheck réussi ;
* déploiement réussi ;
* sauvegarde de la base vérifiée.

---

# 20. ROADMAP

## Phase 0 — Foundation

* repository Git ;
* Next.js, TypeScript, Tailwind ;
* structure du projet ;
* PostgreSQL de développement (Docker Compose) ;
* Prisma initialisé ;
* CI GitHub Actions : lint, typecheck, tests ;
* `CONTEXT.md`, premiers ADR ;
* specs 000 et 001.

## Phase 1 — Applications (CRUD + base de données)

* CRUD complet des candidatures ;
* machine à états des statuts + historique des changements ;
* recherche, filtres, tri.

## Phase 1.5 — Squelette déployé

* décision d'hébergement de la base (Pi + SSD ou Neon) ;
* image Docker construite en CI (ARM64), publiée sur GHCR ;
* déploiement sur la Raspberry Pi ;
* Tailscale + Caddy + HTTPS ;
* healthcheck ;
* **sauvegarde** : `pg_dump` planifié, copié hors de la Pi, restauration testée au moins une fois.

## Phase 2 — Dashboard

Indicateurs, candidatures récentes, statistiques basiques.

## Phase 3 — Interviews

Gestion des entretiens.

## Phase 4 — Calendar

Vue calendrier.

## Phase 5 — Documents

Stockage des CV, lettres et pièces jointes.

## Phase 6 — Profile

Profil structuré (prérequis de l'IA).

## Phase 7 — AI Job Analysis

Analyse d'Annonces (choix du fournisseur par ADR avant de commencer).

## Phase 8 — AI Cover Letter

Brouillons personnalisés.

## Phase 9 — AI Interview Assistant

Préparation aux entretiens.

## Phase 10 — Observability & Hardening

Monitoring, métriques, sécurité et amélioration de l'exploitation.

---

# 21. CONTRAINTES IMPORTANTES POUR TOI

Quand tu travailles sur ce projet avec moi :

* ne génère pas toute l'application en une seule fois ;
* ne saute pas directement à l'IA ;
* ne modifie pas plusieurs fonctionnalités indépendantes dans une même étape sans raison ;
* ne crée pas de complexité inutile ;
* ne choisis pas une librairie supplémentaire sans expliquer son intérêt ;
* ne réécris pas inutilement du code fonctionnel ;
* ne modifie pas les specs silencieusement pour correspondre au code.

Si le code et la spec se contredisent, signale-le.

La **spec est la source de vérité fonctionnelle** jusqu'à ce qu'une décision explicite la modifie.

---

# 22. MODE D'INTERACTION AVEC MOI

Je veux apprendre.

Pour chaque étape importante :

1. explique brièvement ce que nous allons construire ;
2. explique pourquoi ;
3. montre quels fichiers vont être créés ou modifiés ;
4. implémente uniquement le périmètre demandé ;
5. explique les éléments techniques importants ;
6. indique comment tester ;
7. vérifie les critères d'acceptation ;
8. propose ensuite la prochaine étape logique.

Évite les explications interminables lorsque ce n'est pas nécessaire.

Je préfère comprendre progressivement.

---

# 23. RÈGLE IMPORTANTE AVANT LE CODE

Lorsque je demande une nouvelle fonctionnalité importante, commence par produire ou mettre à jour sa SPEC.

Ne commence pas immédiatement par écrire du code.

Workflow attendu :

REQUEST
↓
GRILL (`grill-with-docs`) → CONTEXT.md / ADR
↓
SPEC (`specs/`)
↓
REVIEW DE LA SPEC
↓
TASK BREAKDOWN (`ab-create-roadmap` / `ab-create-task`)
↓
IMPLEMENTATION (missions TDD)
↓
REVIEW (`review-implementation`, `sync-architecture`)
↓
VALIDATION

Si ma demande est ambiguë, choisis l'interprétation la plus cohérente avec la vision produit et indique clairement l'hypothèse retenue.

---

# 24. DÉCISIONS ACTÉES

## Revue senior (2026-09-23)

| # | Décision |
|---|---|
| D1 | Application self-hosted sur Raspberry Pi à domicile ; pas de Vercel ni d'hébergement cloud de l'application. |
| D2 | Accès privé via Tailscale ; pas d'exposition publique ni d'authentification applicative (ADR `0001`). |
| D3 | `ACCEPTED` = **Proposition** acceptée par moi. |
| D4 | `INTERVIEW` = étape d'avancement du workflow, distincte de l'entité `Interview`. |
| D5 | `REJECTED` et `ACCEPTED` sont définitifs : aucun retour vers un autre statut. |
| D6 | Historique des changements de statut conservé dès la Phase 1. |
| D7 | Ajout d'une entité `Profile`, prérequis de l'IA. ~~Relances (`nextActionAt`, `nextActionNote`) et détection de doublons~~ — **annulés le 2026-09-24** (voir D19). |
| D8 | Annonces saisies par copier-coller ; pas de scraping d'URL (ADR `0002`). |
| D9 | Roadmap réordonnée : Foundation + CI → Applications + DB → squelette déployé + backup → Dashboard → … |
| D10 | L'AB Method est la méthode de travail (voir §16). |
| D11 | ORM : Prisma (ADR `0003`). |
| D12 | Build Docker en CI, jamais sur la Pi. |

## Session `grill-with-docs` (2026-09-24)

| # | Décision |
|---|---|
| D13 | Vocabulaire : **Candidature**, **Annonce** (champs de la candidature, pas une entité séparée), **Proposition**. « offre » est réservé à la Proposition, jamais à l'Annonce. |
| D14 | Pas de statut `OFFER` : une Proposition en attente de réponse laisse la candidature en Entretien. `IN_PROGRESS` est supprimé. |
| D15 | Cycle de vie : Brouillon → Postulée → Entretien → Acceptée / Refusée ; Refusée accessible dès Postulée. Brouillon = candidature en cours de saisie. |
| D16 | `ARCHIVED` (**Classée**) = fin sans décision de l'entreprise (aucune réponse, retrait, Proposition déclinée), accessible depuis Postulée ou Entretien ; seule marche arrière autorisée : la **Réouverture** vers Postulée ou Entretien. Pas de statut `WITHDRAWN`, pas d'action « archiver pour cacher » (filtre des listes). |
| D17 | Suppression définitive, avec confirmation explicite, en cascade. |
| D18 | **Entreprise** (`Company`) est une entité dès la Phase 1 ; **Contact** devient une entité en Phase 3. |
| D19 | Relances / prochaine action et détection des doublons retirées du périmètre. |

## Architecture applicative (2026-09-24)

| # | Décision |
|---|---|
| D20 | Monolithe modulaire ; ni serverless ni microservices (ADR `0004`). |
| D21 | Code découpé par fonctionnalité (`src/modules/<fonctionnalité>/`) : domaine pur, schémas Zod, service, Server Actions, composants. |
| D22 | Pas de couche repository : les services utilisent Prisma directement ; écritures multiples en transaction. |
| D23 | Lectures par les Server Components via les services ; écritures par Server Actions ; seul Route Handler : `/api/health`. |
| D24 | Erreurs métier : exceptions typées `DomainError`, converties en message dans les Server Actions ; les erreurs inattendues remontent. |
| D25 | `lib/current-user.ts` est le seul point d'identification de l'utilisateur ; les services reçoivent le `userId`. |
| D26 | Tests d'intégration sur la base `jobflow_test` du conteneur de dev, en série, tables vidées avant chaque test ; PostgreSQL en *service container* en CI. |
| D27 | Le projet reste sur `E:` (exFAT) : npm ; Next.js tourne nativement en dev, seul PostgreSQL est dans Docker. |
| D28 | UI : shadcn/ui (sans son composant `Form`). |
| D29 | Formulaires natifs + Server Actions + `useActionState` ; validation Zod côté serveur. |

---

# 25. QUESTIONS OUVERTES

Q1 à Q5 ont été tranchées le 2026-09-24 (D13 à D18).

| # | Question | Échéance |
|---|---|---|
| Q6 | Hébergement de la base : PostgreSQL sur la Pi (nécessite un SSD) ou Neon (UE) ? Vérifier le support actuel avec `lsblk`. | Phase 1.5 |
| Q7 | Fournisseur d'IA, budget et politique de confidentialité. | Phase 7 |

---

# 26. PREMIÈRE MISSION

Nous commençons maintenant le projet.

Ne développe pas encore l'application complète.

Commence par :

1. ~~lancer `grill-with-docs` pour trancher les questions Q1 à Q5 et créer `CONTEXT.md` et les premiers ADR~~ — fait le 2026-09-24 ;
2. proposer l'arborescence initiale du repository ;
3. rédiger `specs/000-product-vision.md` ;
4. rédiger `specs/001-application-management.md` ;
5. construire la roadmap avec `ab-create-roadmap`, puis planifier uniquement les tâches des Phases 0 et 1 avec `ab-create-task` ;
6. attendre la validation de la spec 001 avant d'implémenter quoi que ce soit.

Pour chaque décision proposée, privilégie une solution simple et professionnelle pouvant évoluer ultérieurement.
