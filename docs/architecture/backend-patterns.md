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
│       ├── form-values.ts     Correspondance saisie ↔ colonnes, dans les deux sens (`toColumns` / `toFormValues`)
│       ├── service.ts         ③ Cas d'usage : lectures et écritures, transactions
│       ├── actions.ts         ④ Server Actions ('use server')
│       └── components/        UI propre au module (voir frontend-patterns.md)
├── components/ui/             Composants shadcn/ui partagés
└── lib/
    ├── db.ts                  Client Prisma unique
    ├── env.ts                 Variables d'environnement validées (Zod)
    ├── current-user.ts        Utilisateur courant
    ├── dates.ts               Date du jour (AAAA-MM-JJ) dans le fuseau Europe/Paris (`todayInParis`), partagée serveur / navigateur
    └── errors.ts              DomainError et conversion en réponse d'action
```

Un module = une spec. Le vocabulaire du code suit le glossaire du domaine (`Application`, `Company`, `ApplicationStatus`…).

### Frontières entre modules (ADR `0004`)

- Un module utilise un autre module **via son service**, jamais en interrogeant directement ses tables.
- Les relations Prisma entre tables de modules différents sont autorisées (clés étrangères, `include` en lecture) ; les **écritures** restent chez le module propriétaire.

## Les couches

### ① Domaine — `modules/*/domain/`

- TypeScript pur : **aucun import** de Next.js, de Prisma ou de React.
- Contient les règles métier testables sans base : machine à états des statuts (`domain/status.ts`, table unique `STATUS_TRANSITIONS`), normalisation du nom d'Entreprise.
- Déterministe : pas d'accès à l'horloge ni à la base ; la date courante est passée en paramètre si nécessaire.

```ts
// modules/applications/domain/status.ts
export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean
export function allowedTransitions(from: ApplicationStatus): ApplicationStatus[]
export function isDefinitive(status: ApplicationStatus): boolean  // Statut définitif : aucune transition sortante
```

### ② Schémas — `modules/*/schemas.ts`

- Un schéma Zod par entrée (création, modification, changement de statut, filtres de liste).
- Les types d'entrée du service sont **dérivés** des schémas (`z.infer`), jamais redéclarés.
- Les règles qui dépendent de plusieurs champs (salaire min ≤ max, date obligatoire en Postulée) sont exprimées dans le schéma (`superRefine`) en s'appuyant sur les fonctions du domaine.
- Les schémas acceptent **directement les chaînes envoyées par le formulaire** : une chaîne vide devient `undefined` (`z.preprocess`), les montants sont convertis en nombres (`z.coerce`).
- Un champ fichier est validé comme `z.instanceof(File)` (type et taille) ; un champ fichier laissé vide arrive dans la Server Action comme un fichier de 0 octet nommé « blob » : `z.preprocess` le convertit en `undefined` (« pas de fichier »).
- Une règle qui dépend de la date du jour reçoit cette date en paramètre (`createApplicationSchema(today)`) : le schéma reste déterministe et testable ; l'action calcule `today` dans le fuseau `Europe/Paris`.
- Les énumérations du domaine sont des tableaux `as const` (`APPLICATION_STATUSES`…) dont on dérive les types ; leurs libellés français vivent dans `modules/<module>/labels.ts`.
- Une case à cocher HTML arrive comme `"on"` ou absente : `z.preprocess` la convertit en booléen (`removeCv`, `removeCoverLetter`).
- Création et modification partagent les mêmes champs et règles entre champs (`applicationFields`, `crossFieldRules(today)`) ; le schéma de modification n'a pas de statut et ajoute les cases de retrait des pièces jointes.
- Un champ obligatoire passe par l'utilitaire `required(schema, label)` : chaîne vide ou absente → message « <Libellé> est obligatoire », puis validation par le schéma cible (`z.enum`, `z.iso.date`…).

### ③ Service — `modules/*/service.ts`

- Exporte des **fonctions** (pas de classes) : `createApplication`, `changeApplicationStatus`, `deleteApplication`, `listApplications`, `getApplication`…
- Reçoit **toujours** le `userId` en premier paramètre ; filtre toutes les requêtes par `userId`.
- Reçoit des données **déjà validées** (types issus des schémas).
- Utilise Prisma **directement** : pas de couche repository. Prisma est déjà l'abstraction d'accès aux données ; une interface à implémentation unique serait une couche sans profondeur.
- Toute écriture multiple qui doit être atomique passe par `prisma.$transaction` — ex. nouveau statut **et** ligne d'historique.
- Applique les règles du domaine avec l'état **lu en base dans la transaction** (pas celui envoyé par le client) : c'est ce qui protège contre les requêtes forgées et les onglets concurrents.
- Lance une `DomainError` pour toute violation de règle métier.
- Une écriture écrit **chaque** colonne explicitement : un champ vidé devient `null` (Prisma ignore `undefined` et garderait l'ancienne valeur). La correspondance saisie ↔ colonnes vit dans `modules/<module>/form-values.ts` : `toColumns` pour enregistrer, `toFormValues` pour pré-remplir la modification.
- Un identifiant reçu de l'URL est vérifié (`z.uuid()`) avant la requête : un id mal formé lance `NotFoundError` (la colonne uuid de PostgreSQL rejetterait la requête), comme une ressource introuvable.

### ④ Actions — `modules/*/actions.ts`

- Adaptateurs web **sans règle métier** : `FormData` → validation Zod → `getCurrentUserId()` → service → `revalidatePath` / `redirect`.
- Signature compatible `useActionState` : `(prevState, formData) => Promise<ActionState>`.
- Convertissent les erreurs via l'utilitaire commun (voir « Erreurs »).
- Les entrées de `FormData` sont séparées en chaînes et en `File` : les deux sont validées ensemble, seules les chaînes sont renvoyées au formulaire en cas d'erreur (un fichier ne peut pas être ré-affiché).
- Une action qui vise une ressource reçoit son id en premier paramètre, lié par la page (`updateApplicationAction.bind(null, id)`) ; l'id est vérifié par le service, pas par l'action.
- États renvoyés : `idle | error | success | warning`. `warning` = enregistré, mais le message demande une action à l'utilisateur (ex. fichier à supprimer à la main).

### Lectures

- Les pages (Server Components) appellent **directement** les fonctions de lecture du service. Pas de Server Action ni d'API interne pour lire.
- Pas de Route Handler métier : le seul Route Handler est `/api/health`.

### Services externes — `src/lib/storage.ts`

- Un service externe (stockage des pièces jointes, ADR `0006`) est appelé **uniquement** à travers un adaptateur de `lib/` à interface étroite : `FileStorage` (`upload(file)`, `remove(keys)`), implémenté par `createUploadThingStorage(client)`. Ce n'est pas un repository : c'est la frontière avec un système que les tests ne doivent pas appeler.
- Le service reçoit l'adaptateur en paramètre, avec la valeur de production par défaut (`storage = getStorage()`) ; les tests d'intégration passent `createMemoryStorage()` (`src/test/memory-storage.ts`), qui sait aussi simuler un échec d'envoi ou de suppression.
- Ordre fichier → base : envoyer d'abord, enregistrer ensuite dans la transaction ; si l'enregistrement échoue, supprimer les fichiers envoyés, et si cette suppression échoue aussi, le dire à l'utilisateur (`DomainError`) et journaliser les clés restées chez le service.
- Remplacer ou retirer un fichier : l'ancien n'est supprimé du stockage qu'**après** l'enregistrement (la transaction renvoie les fichiers devenus obsolètes). Si cette suppression échoue, la modification reste faite : le service renvoie `leftover` (fichier à supprimer à la main) et l'action répond `status: "warning"`. Création et modification partagent `uploadAttachments` (envoi, et nettoyage si un envoi échoue) et `saveOrDiscard` (si l'enregistrement échoue, suppression des fichiers envoyés ; une `DomainError` garde son message).

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
- Retirer une valeur d'un enum PostgreSQL ne se fait pas sans perte par la migration générée : la migration est écrite à la main. Elle convertit d'abord les lignes (tables et historique), crée `<Enum>_new`, bascule les colonnes (`USING col::text::"<Enum>_new"`), supprime l'ancien type puis renomme le nouveau ; `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma` sur `jobflow_test` doit ensuite renvoyer une migration vide. Exemple : `20260927160000_three_application_statuses`.

## Tests

| Couche | Type de test | Emplacement |
|---|---|---|
| Domaine | Unitaire, sans base | À côté du fichier : `status.test.ts` |
| Schémas | Unitaire, sans base | `schemas.test.ts` |
| Service | Intégration, base `jobflow_test` | `service.integration.test.ts` (projet `integration`, exécuté en série) |
| Actions | Pas testées directement : minces par construction | — |

Chaque test cite l'identifiant du critère d'acceptation couvert (`it("AC-001-06 refuse INTERVIEW → APPLIED", …)`).
