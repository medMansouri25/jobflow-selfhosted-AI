# Backend patterns

Conventions du code serveur. Tout écart est discuté et, s'il est durable, documenté ici.

## Organisation : un module par fonctionnalité

```
src/
├── app/                       Routes Next.js — minces : lisent via les services, écrivent via les actions
├── modules/
│   └── <fonctionnalité>/      ex. applications (SPEC-001), companies, interviews (SPEC-003)
│       ├── domain/            ① TypeScript pur : règles métier, types, erreurs métier
│       ├── schemas.ts         ② Schémas Zod des entrées
│       ├── service.ts         ③ Cas d'usage : lectures et écritures, transactions
│       ├── actions.ts         ④ Server Actions ('use server')
│       └── components/        UI propre au module (voir frontend-patterns.md)
├── components/ui/             Composants shadcn/ui partagés
└── lib/
    ├── db.ts                  Client Prisma unique
    ├── env.ts                 Variables d'environnement validées (Zod)
    ├── current-user.ts        Utilisateur courant
    └── errors.ts              DomainError et conversion en réponse d'action
```

Un module = une spec. Le vocabulaire du code suit le glossaire du domaine (`Application`, `Company`, `ApplicationStatus`…).

### Frontières entre modules (ADR `0004`)

- Un module utilise un autre module **via son service**, jamais en interrogeant directement ses tables.
- Les relations Prisma entre tables de modules différents sont autorisées (clés étrangères, `include` en lecture) ; les **écritures** restent chez le module propriétaire.

## Les couches

### ① Domaine — `modules/*/domain/`

- TypeScript pur : **aucun import** de Next.js, de Prisma ou de React.
- Contient les règles métier testables sans base : machine à états des statuts, règles de champs obligatoires selon le statut, normalisation du nom d'Entreprise.
- Déterministe : pas d'accès à l'horloge ni à la base ; la date courante est passée en paramètre si nécessaire.

```ts
// modules/applications/domain/status.ts
export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean
export function allowedTransitions(from: ApplicationStatus): ApplicationStatus[]
```

### ② Schémas — `modules/*/schemas.ts`

- Un schéma Zod par entrée (création, modification, changement de statut, filtres de liste).
- Les types d'entrée du service sont **dérivés** des schémas (`z.infer`), jamais redéclarés.
- Les règles qui dépendent de plusieurs champs (salaire min ≤ max, date obligatoire en Postulée) sont exprimées dans le schéma (`superRefine`) en s'appuyant sur les fonctions du domaine.

### ③ Service — `modules/*/service.ts`

- Exporte des **fonctions** (pas de classes) : `createApplication`, `changeApplicationStatus`, `deleteApplication`, `listApplications`, `getApplication`…
- Reçoit **toujours** le `userId` en premier paramètre ; filtre toutes les requêtes par `userId`.
- Reçoit des données **déjà validées** (types issus des schémas).
- Utilise Prisma **directement** : pas de couche repository. Prisma est déjà l'abstraction d'accès aux données ; une interface à implémentation unique serait une couche sans profondeur.
- Toute écriture multiple qui doit être atomique passe par `prisma.$transaction` — ex. nouveau statut **et** ligne d'historique.
- Applique les règles du domaine avec l'état **lu en base dans la transaction** (pas celui envoyé par le client) : c'est ce qui protège contre les requêtes forgées et les onglets concurrents.
- Lance une `DomainError` pour toute violation de règle métier.

### ④ Actions — `modules/*/actions.ts`

- Adaptateurs web **sans règle métier** : `FormData` → validation Zod → `getCurrentUserId()` → service → `revalidatePath` / `redirect`.
- Signature compatible `useActionState` : `(prevState, formData) => Promise<ActionState>`.
- Convertissent les erreurs via l'utilitaire commun (voir « Erreurs »).

### Lectures

- Les pages (Server Components) appellent **directement** les fonctions de lecture du service. Pas de Server Action ni d'API interne pour lire.
- Pas de Route Handler métier : le seul Route Handler est `/api/health`.

## Erreurs

```ts
// lib/errors.ts
export class DomainError extends Error { code: string }
export class NotFoundError extends DomainError {}
export class InvalidTransitionError extends DomainError {}
```

| Type d'erreur | Où elle naît | Ce qu'en fait l'action | Ce que voit l'utilisateur |
|---|---|---|---|
| Validation Zod | Action (parsing) | Renvoie `fieldErrors` | Message sous chaque champ, saisie conservée |
| `DomainError` | Service / domaine | Renvoie un message métier | Message en tête de formulaire |
| `NotFoundError` sur une page | Service | La page appelle `notFound()` | Page 404 |
| Toute autre erreur | N'importe où | **Relancée** | Page d'erreur Next.js (`error.tsx`) ; erreur journalisée |

Les erreurs inattendues ne sont jamais avalées ni transformées en message métier.

## Utilisateur courant

- `lib/current-user.ts` expose `getCurrentUserId()`, qui renvoie l'utilisateur unique créé par le seed.
- C'est le **seul** endroit qui sait comment l'utilisateur est identifié : l'ajout futur d'une authentification ne modifie que ce fichier.
- Les services ne l'appellent jamais eux-mêmes : ils reçoivent le `userId`.

## Base de données

- Schéma, migrations et seed dans `prisma/`. Toute modification du schéma passe par une migration versionnée (`prisma migrate dev`), jamais par `db push` sur une base partagée.
- Noms de modèles et de champs en anglais (`Application`, `appliedAt`) ; libellés français uniquement dans l'UI.
- Horodatages en UTC (`timestamptz`) ; les dates sans heure (`appliedAt`) en type `date`.
- Suppressions en cascade déclarées dans le schéma (`onDelete: Cascade`) quand la spec l'exige.

## Tests

| Couche | Type de test | Emplacement |
|---|---|---|
| Domaine | Unitaire, sans base | À côté du fichier : `status.test.ts` |
| Schémas | Unitaire, sans base | `schemas.test.ts` |
| Service | Intégration, base `jobflow_test` | `service.test.ts` (suite exécutée en série) |
| Actions | Pas testées directement : minces par construction | — |

Chaque test cite l'identifiant du critère d'acceptation couvert (`it("AC-001-06 refuse DRAFT → ACCEPTED", …)`).
