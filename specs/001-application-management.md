# SPEC-001 — Gestion des Candidatures

| | |
|---|---|
| **Statut** | Draft — en attente de validation |
| **Date** | 2026-09-24 |
| **Phase** | 1 — Applications (CRUD + base de données) |
| **Vocabulaire** | `CONTEXT.md` fait foi (glossaire local) |
| **Dépend de** | [SPEC-000](./000-product-vision.md) |

> Les points marqués **⚑ Hypothèse** sont des choix que j'ai faits par défaut pour compléter la spec. Ils sont à confirmer ou corriger pendant la revue.

---

## 1. Problème

Mes Candidatures sont éparpillées. Je ne retrouve ni l'Annonce d'origine, ni la version de CV envoyée, ni l'avancement de chaque Candidature, ni le moment où elle a changé de statut.

## 2. Objectif

Pouvoir **enregistrer, retrouver, faire avancer et supprimer** chaque Candidature, avec son Entreprise, son Annonce et un historique fiable de ses statuts. Cette base sert ensuite au dashboard (SPEC-002), aux entretiens (SPEC-003) et à l'IA.

## 3. Périmètre

### Inclus

- Création, consultation, modification et suppression d'une Candidature.
- Entreprise comme entité, créée ou choisie depuis le formulaire de Candidature.
- Cycle de vie des statuts (machine à états) et historique des changements.
- Liste des Candidatures : recherche, filtres, tri, pagination.

### Exclus

| Exclu | Où / quand |
|---|---|
| Entité Entretien et passage automatique en Entretien à l'ajout d'un entretien | SPEC-003 |
| Entité Contact | SPEC-003 |
| Page de gestion des Entreprises (renommer, fusionner, supprimer) | Plus tard, si le besoin apparaît |
| Dashboard et statistiques | SPEC-002 |
| Fichiers joints (CV, lettre en PDF) | SPEC-005 |
| Relances, détection des doublons | Hors périmètre (décision du 2026-09-24) |
| Import / export | Non prévu |

## 4. User stories

| ID | En tant qu'utilisateur, je veux… | …afin de… |
|---|---|---|
| US-001-01 | enregistrer une Annonce repérée en **Brouillon** avec le minimum d'informations | ne pas la perdre avant d'avoir postulé |
| US-001-02 | enregistrer directement une Candidature **Postulée** | saisir une candidature déjà envoyée |
| US-001-03 | coller la description complète de l'Annonce | la relire même si elle a disparu en ligne |
| US-001-04 | choisir une Entreprise existante ou en créer une en tapant son nom | ne pas avoir la même Entreprise en trois orthographes |
| US-001-05 | faire avancer le statut d'une Candidature | savoir où en est chaque démarche |
| US-001-06 | **classer** une Candidature sans réponse, puis la **rouvrir** si l'Entreprise se manifeste | garder ma liste active propre sans rien perdre |
| US-001-07 | consulter l'historique des statuts d'une Candidature | savoir quand elle a avancé |
| US-001-08 | rechercher, filtrer et trier mes Candidatures | retrouver une Candidature en quelques secondes |
| US-001-09 | supprimer une Candidature saisie par erreur | corriger une erreur |

## 5. Exigences fonctionnelles

| ID | Exigence |
|---|---|
| FR-001-01 | Créer une Candidature au statut **Brouillon** ou **Postulée**. Aucun autre statut initial n'est possible. |
| FR-001-02 | Modifier tous les champs d'une Candidature, quel que soit son statut, **sauf le statut**, qui ne change que par l'action dédiée (FR-001-05). |
| FR-001-03 | Consulter une Candidature : tous ses champs, son Entreprise et son historique des statuts. |
| FR-001-04 | Choisir une Entreprise existante par autocomplétion sur le nom, ou en créer une nouvelle depuis le même champ. |
| FR-001-05 | Changer le statut d'une Candidature via une action dédiée qui ne propose **que** les transitions autorisées (BR-001-05). |
| FR-001-06 | Enregistrer chaque changement de statut, y compris le statut initial à la création, dans l'historique. |
| FR-001-07 | Supprimer une Candidature après confirmation explicite. |
| FR-001-08 | Lister les Candidatures, par défaut les **Candidatures actives** uniquement. |
| FR-001-09 | Rechercher par texte sur : nom de l'Entreprise, intitulé du poste, localisation. |
| FR-001-10 | Filtrer par : statut (plusieurs possibles), « actives / terminées / toutes », type de contrat, source. |
| FR-001-11 | Trier par : date de dernière modification (défaut, décroissant), date de candidature, nom de l'Entreprise. |
| FR-001-12 | Paginer la liste par pages de 25 Candidatures. ⚑ Hypothèse |

## 6. Règles métier

### Champs

| ID | Règle |
|---|---|
| BR-001-01 | En **Brouillon**, seuls l'**Entreprise** et l'**intitulé du poste** sont obligatoires. |
| BR-001-02 | Pour être **Postulée** (à la création ou par transition), une Candidature doit avoir une **date de candidature**. Si elle est absente au moment de la transition, elle est proposée par défaut à la date du jour. ⚑ Hypothèse : la description de l'Annonce reste facultative, pour couvrir les candidatures spontanées sans Annonce. |
| BR-001-03 | La date de candidature ne peut pas être dans le futur. |
| BR-001-04 | Salaire : `salaryMin` ≤ `salaryMax` quand les deux sont saisis ; dès qu'un montant est saisi, la devise et la période sont obligatoires. Devise par défaut : EUR. |

### Cycle de vie

| ID | Règle |
|---|---|
| BR-001-05 | Transitions autorisées — toute autre transition est refusée : |

| Depuis | Vers |
|---|---|
| Brouillon | Postulée |
| Postulée | Entretien, Refusée, Classée |
| Entretien | Acceptée, Refusée, Classée |
| Classée | Postulée, Entretien (**Réouverture**) |
| Acceptée | — (définitive) |
| Refusée | — (définitive) |

| ID | Règle |
|---|---|
| BR-001-06 | Un Brouillon abandonné ne se classe pas : il se **supprime**. |
| BR-001-07 | En Phase 1, le passage en **Entretien** est manuel. Le passage automatique à l'ajout d'un entretien relève de SPEC-003. |
| BR-001-08 | Une Proposition reçue et en attente de réponse ne change pas le statut : la Candidature reste en **Entretien** ; la date limite se note dans les notes. |
| BR-001-09 | La date d'un changement de statut est l'instant où je l'enregistre. ⚑ Hypothèse : pas de saisie d'une date passée (« refusée il y a 3 jours ») en Phase 1. |
| BR-001-10 | Une Candidature **Acceptée** ou **Refusée** reste modifiable (notes, champs de l'Annonce) ; seul son statut est figé. |

### Entreprise

| ID | Règle |
|---|---|
| BR-001-11 | Le nom d'une Entreprise est unique **sans distinction de casse** et après suppression des espaces en début et fin (« Capgemini » = « capgemini » = « Capgemini  »). |
| BR-001-12 | Supprimer une Candidature ne supprime pas son Entreprise, même si c'était la dernière Candidature liée. ⚑ Hypothèse |

### Suppression

| ID | Règle |
|---|---|
| BR-001-13 | La suppression est **définitive** et **en cascade** : l'historique des statuts de la Candidature est supprimé avec elle (et, à partir de SPEC-003, ses entretiens). |

## 7. Modèle de données

Chaque entité porte un `userId`. En Phase 1, un seul utilisateur existe et toutes les requêtes sont filtrées par cet utilisateur.

### User

| Champ | Type | Obligatoire | Contraintes |
|---|---|---|---|
| id | identifiant | oui | |
| createdAt | horodatage | oui | |

Un seul enregistrement, créé par le script d'initialisation de la base (seed).

### Company — Entreprise

| Champ | Type | Obligatoire | Contraintes |
|---|---|---|---|
| id | identifiant | oui | |
| userId | → User | oui | |
| name | texte | oui | 1–200 caractères, espaces de début et fin supprimés |
| normalizedName | texte | oui | `name` en minuscules ; unique par `userId` (BR-001-11) |
| website | URL | non | `http` ou `https` uniquement, ≤ 2048 caractères |
| createdAt, updatedAt | horodatage | oui | |

### Application — Candidature

| Champ | Type | Obligatoire | Contraintes |
|---|---|---|---|
| id | identifiant | oui | |
| userId | → User | oui | |
| companyId | → Company | oui | |
| status | enum `ApplicationStatus` | oui | voir BR-001-05 |
| jobTitle | texte | oui | 1–200 caractères |
| location | texte | non | ≤ 200 caractères |
| contractType | enum `ContractType` | non | |
| jobUrl | URL | non | `http` ou `https` uniquement, ≤ 2048 caractères |
| source | enum `ApplicationSource` | non | |
| jobDescription | texte long | non | ≤ 50 000 caractères, stocké et affiché en **texte brut** |
| salaryMin, salaryMax | entier positif | non | BR-001-04 |
| salaryCurrency | code ISO 4217 | si montant | défaut `EUR` |
| salaryPeriod | enum `YEARLY` / `MONTHLY` | si montant | |
| appliedAt | date (sans heure) | si Postulée ou au-delà | BR-001-02, BR-001-03 |
| cvLabel | texte | non | ≤ 200 caractères (ex. « CV_2026_backend_v3 ») |
| coverLetter | texte long | non | ≤ 20 000 caractères |
| notes | texte long | non | ≤ 20 000 caractères |
| createdAt, updatedAt | horodatage | oui | |

### ApplicationStatusChange — Historique des statuts

| Champ | Type | Obligatoire | Contraintes |
|---|---|---|---|
| id | identifiant | oui | |
| applicationId | → Application | oui | suppression en cascade |
| fromStatus | enum `ApplicationStatus` | non | vide pour l'entrée de création |
| toStatus | enum `ApplicationStatus` | oui | |
| changedAt | horodatage UTC | oui | |

### Énumérations

| Enum | Valeurs |
|---|---|
| `ApplicationStatus` | `DRAFT`, `APPLIED`, `INTERVIEW`, `ACCEPTED`, `REJECTED`, `ARCHIVED` |
| `ContractType` ⚑ | `CDI`, `CDD`, `INTERNSHIP` (stage), `APPRENTICESHIP` (alternance), `FREELANCE`, `TEMPORARY` (intérim), `OTHER` |
| `ApplicationSource` ⚑ | `LINKEDIN`, `INDEED`, `WELCOME_TO_THE_JUNGLE`, `APEC`, `FRANCE_TRAVAIL`, `COMPANY_WEBSITE`, `REFERRAL` (cooptation), `SPONTANEOUS` (candidature spontanée), `OTHER` |

Codes en anglais dans la base et le code ; libellés en français dans l'interface.

## 8. Expérience utilisateur

| Page | Contenu |
|---|---|
| `/applications` | Liste : Entreprise, poste, statut (badge), date de candidature, dernière modification. Barre de recherche, filtres, tri, pagination. Bouton « Nouvelle candidature ». État vide avec un appel à créer la première Candidature. |
| `/applications/new` | Formulaire. Choix du statut initial (Brouillon / Postulée). Champ Entreprise avec autocomplétion et option « Créer « … » ». |
| `/applications/[id]` | Détail : champs, description de l'Annonce en texte brut (retours à la ligne conservés), lien vers l'Annonce ouvert dans un nouvel onglet, historique des statuts (le plus récent en haut), actions « Changer le statut », « Modifier », « Supprimer ». |
| `/applications/[id]/edit` | Même formulaire que la création, sans le statut. |

- **Changer le statut** : un menu ne proposant que les transitions autorisées depuis le statut courant. Pour Acceptée et Refusée, le menu indique que le changement est définitif et demande confirmation.
- **Supprimer** : une fenêtre de confirmation rappelant l'Entreprise et le poste, précisant que l'action est irréversible.
- **Erreurs de validation** : affichées sous le champ concerné, sans perdre la saisie.
- **Candidature introuvable** (id inexistant) : page 404.
- Interface en français.

## 9. Critères d'acceptation

| ID | Étant donné | Quand | Alors |
|---|---|---|---|
| AC-001-01 | aucune Entreprise « Thales » | je crée un Brouillon avec l'Entreprise « Thales » et le poste « Dev Backend » | la Candidature est créée en Brouillon, l'Entreprise « Thales » est créée, l'historique contient une entrée `— → DRAFT` |
| AC-001-02 | le formulaire de création | je crée un Brouillon sans intitulé de poste | la création est refusée avec un message sur le champ intitulé |
| AC-001-03 | le formulaire de création | je crée une Candidature Postulée sans date de candidature | la création est refusée avec un message sur le champ date |
| AC-001-04 | l'Entreprise « Capgemini » existe | je crée une Candidature en tapant « capgemini » | elle est rattachée à l'Entreprise existante ; aucune nouvelle Entreprise n'est créée |
| AC-001-05 | une Candidature Postulée | je la passe en Entretien | le statut devient Entretien et l'historique contient `APPLIED → INTERVIEW` avec l'horodatage |
| AC-001-06 | une Candidature Brouillon | je demande la transition vers Acceptée | la transition est refusée côté serveur, même si la requête est forgée hors de l'interface |
| AC-001-07 | une Candidature Refusée | j'ouvre le menu « Changer le statut » | aucune transition n'est proposée |
| AC-001-08 | une Candidature Refusée | j'envoie directement une requête de transition vers Postulée | la transition est refusée côté serveur |
| AC-001-09 | une Candidature Classée | je la rouvre vers Entretien | le statut devient Entretien et l'historique contient `ARCHIVED → INTERVIEW` |
| AC-001-10 | une Candidature Brouillon sans date de candidature | je la passe en Postulée | la date du jour est proposée ; après validation, `appliedAt` vaut cette date |
| AC-001-11 | une Candidature Refusée | je modifie ses notes | la modification est enregistrée ; le statut reste Refusée |
| AC-001-12 | une Candidature avec 3 changements de statut | je la supprime et confirme | la Candidature et ses 3 entrées d'historique n'existent plus ; son Entreprise existe toujours |
| AC-001-13 | une Candidature | je clique sur Supprimer puis annule | rien n'est supprimé |
| AC-001-14 | 2 Candidatures actives et 1 Refusée | j'ouvre la liste | seules les 2 Candidatures actives s'affichent |
| AC-001-15 | les mêmes Candidatures | je choisis le filtre « terminées » | seule la Candidature Refusée s'affiche |
| AC-001-16 | des Candidatures chez « Thales » et « Airbus » | je recherche « thal » | seules les Candidatures chez Thales s'affichent |
| AC-001-17 | une saisie de salaire min 50 000 et max 40 000 | j'enregistre | l'enregistrement est refusé avec un message sur le salaire |
| AC-001-18 | une URL d'Annonce `javascript:alert(1)` | j'enregistre | l'enregistrement est refusé : seules les URL `http`/`https` sont acceptées |
| AC-001-19 | une description d'Annonce contenant `<script>alert(1)</script>` | j'affiche la Candidature | le texte s'affiche tel quel, rien n'est exécuté |
| AC-001-20 | un id de Candidature inexistant | j'ouvre `/applications/[id]` | j'obtiens une page 404 |
| AC-001-21 | 30 Candidatures actives | j'ouvre la liste | 25 s'affichent, avec un accès à la page suivante |

## 10. Cas limites

| Cas | Comportement attendu |
|---|---|
| Nom d'Entreprise avec espaces ou casse différente | Rattaché à l'Entreprise existante (BR-001-11) |
| Deux Candidatures pour le même poste dans la même Entreprise | Autorisé ; aucun avertissement (pas de détection des doublons) |
| Candidature spontanée sans Annonce publiée | Autorisée : description et URL facultatives, source `SPONTANEOUS` |
| Description d'Annonce très longue (copier-coller d'une page entière) | Acceptée jusqu'à 50 000 caractères ; au-delà, message explicite |
| Double clic sur « Enregistrer » | Une seule Candidature créée (bouton désactivé pendant l'envoi) |
| Changement de statut concurrent (deux onglets ouverts) | La transition est validée par rapport au statut **actuel en base** ; si elle n'est plus autorisée, elle est refusée avec un message invitant à recharger |
| Recherche avec caractères spéciaux (`%`, `_`, `'`) | Traités comme du texte, sans erreur |
| Candidature Classée puis rouverte plusieurs fois | Chaque aller-retour apparaît dans l'historique |

## 11. Sécurité

- **Accès** : l'application n'est joignable que via Tailscale (ADR `0001`) ; pas d'authentification applicative en Phase 1. Toutes les requêtes sont néanmoins filtrées par `userId`.
- **Validation** : toute entrée est validée **côté serveur** par des schémas Zod, y compris les transitions de statut. La validation côté client n'est qu'un confort.
- **XSS** : la description, les notes et la lettre sont affichées en texte brut, jamais interprétées comme du HTML ou du Markdown.
- **URL** : seules les URL `http`/`https` sont acceptées ; les liens externes s'ouvrent avec `rel="noopener noreferrer"`.
- **Injection SQL** : requêtes paramétrées via Prisma ; la recherche n'utilise jamais de SQL construit par concaténation.
- **Requêtes forgées** : les Server Actions de Next.js vérifient l'origine des requêtes ; la machine à états est appliquée côté serveur (AC-001-06, AC-001-08).
- **Secrets** : la chaîne de connexion à la base est dans `.env`, qui n'est jamais commité ; un `.env.example` sans valeur réelle est versionné.

## 12. Plan de test

| Niveau | Outil | Ce qui est testé | Critères couverts |
|---|---|---|---|
| Unitaire | Vitest | Machine à états (toutes les transitions autorisées et interdites) | AC-001-05 à 09 |
| Unitaire | Vitest | Schémas Zod : champs obligatoires selon le statut, salaire, URL, longueurs | AC-001-02, 03, 17, 18 |
| Unitaire | Vitest | Normalisation du nom d'Entreprise | AC-001-04 |
| Intégration | Vitest + PostgreSQL (Docker) | Actions serveur : création avec historique, transition, suppression en cascade, recherche, filtres, tri, pagination | AC-001-01, 04, 05, 09 à 12, 14 à 16, 21 |
| Composant / manuel | Vitest + Testing Library, ou vérification manuelle en Phase 1 | Menu de statut, confirmation de suppression, affichage en texte brut, page 404 | AC-001-07, 13, 19, 20 |

Les tests de bout en bout (Playwright) ne font pas partie de la Phase 1.

Chaque test cite l'identifiant du critère qu'il couvre (ex. `it("AC-001-06 refuse DRAFT → ACCEPTED", …)`).

---

## Points à valider en revue

| # | Hypothèse | Alternative |
|---|---|---|
| H1 | Description de l'Annonce facultative, même en Postulée (BR-001-02) | La rendre obligatoire hors source `SPONTANEOUS` |
| H2 | Pas de saisie d'une date passée pour un changement de statut (BR-001-09) | Champ « date réelle » facultatif, défaut maintenant |
| H3 | L'Entreprise reste après suppression de sa dernière Candidature (BR-001-12) | Supprimer les Entreprises orphelines |
| H4 | Listes `ContractType` et `ApplicationSource` (§7) | Ajouter / retirer des valeurs, ou texte libre pour la source |
| H5 | Pagination par 25 (FR-001-12) | Pas de pagination tant qu'il y a peu de Candidatures |
