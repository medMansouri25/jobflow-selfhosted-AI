# SPEC-001 — Gestion des Candidatures

| | |
|---|---|
| **Statut** | **Implémentée** le 2026-09-30 (validée : hypothèses H1 à H5 tranchées) |
| **Date** | 2026-09-24 |
| **Phase** | 1 — Applications (CRUD + base de données) |
| **Vocabulaire** | `CONTEXT.md` fait foi (glossaire local) |
| **Dépend de** | [SPEC-000](./000-product-vision.md) |

> **Révision du 2026-09-27** — trois statuts seulement : **Postulée → Entretien → Refusée** ([ADR 0005](../docs/adr/0005-trois-statuts-de-candidature.md)). Brouillon, Acceptée et Classée sont retirés ; les exigences concernées sont barrées ou réécrites, leurs identifiants sont conservés.

> Les points qui étaient marqués **⚑ Hypothèse** ont tous été tranchés (voir « Points à valider en revue ») ; la mention est gardée là où elle a été confirmée.

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
| Bibliothèque de documents partagés entre Candidatures | SPEC-005 |
| Relances, détection des doublons | Hors périmètre (décision du 2026-09-24) |
| Import / export | Non prévu |

## 4. User stories

| ID | En tant qu'utilisateur, je veux… | …afin de… |
|---|---|---|
| US-001-01 | ~~enregistrer une Annonce repérée en Brouillon~~ _Retiré le 2026-09-27 (trois statuts, ADR 0005)._ | — |
| US-001-02 | enregistrer directement une Candidature **Postulée** | saisir une candidature déjà envoyée |
| US-001-03 | coller la description complète de l'Annonce | la relire même si elle a disparu en ligne |
| US-001-04 | choisir une Entreprise existante ou en créer une en tapant son nom | ne pas avoir la même Entreprise en trois orthographes |
| US-001-05 | faire avancer le statut d'une Candidature | savoir où en est chaque démarche |
| US-001-06 | ~~classer une Candidature sans réponse, puis la rouvrir~~ _Retiré le 2026-09-27 (trois statuts, ADR 0005)._ Une Candidature sans réponse reste Postulée. | — |
| US-001-07 | consulter l'historique des statuts d'une Candidature | savoir quand elle a avancé |
| US-001-08 | rechercher, filtrer et trier mes Candidatures | retrouver une Candidature en quelques secondes |
| US-001-09 | supprimer une Candidature saisie par erreur | corriger une erreur |

## 5. Exigences fonctionnelles

| ID | Exigence |
|---|---|
| FR-001-01 | Créer une Candidature, toujours au statut **Postulée** (aucun choix de statut à la création). |
| FR-001-02 | Modifier tous les champs d'une Candidature, quel que soit son statut, **sauf le statut**, qui ne change que par l'action dédiée (FR-001-05). |
| FR-001-03 | Consulter une Candidature : tous ses champs, son Entreprise et son historique des statuts. |
| FR-001-04 | Choisir une Entreprise existante par autocomplétion sur le nom, ou en créer une nouvelle depuis le même champ. |
| FR-001-05 | Changer le statut d'une Candidature via une action dédiée qui ne propose **que** les transitions autorisées (BR-001-05). |
| FR-001-06 | Enregistrer chaque changement de statut, y compris le statut initial à la création, dans l'historique. |
| FR-001-07 | Supprimer une Candidature après confirmation explicite. |
| FR-001-08 | Lister toutes les Candidatures, quel que soit leur statut. |
| FR-001-09 | Rechercher par texte sur : nom de l'Entreprise, intitulé du poste, localisation. |
| FR-001-10 | Filtrer par : statut (plusieurs possibles, en cases à cocher), type de contrat, source. |
| FR-001-11 | Trier par : date de dernière modification (défaut, décroissant), date de candidature, nom de l'Entreprise. |
| FR-001-12 | Paginer la liste par pages de 25 Candidatures. _Hypothèse H5 confirmée le 2026-09-30._ |

## 6. Règles métier

### Champs

| ID | Règle |
|---|---|
| BR-001-01 | ~~En Brouillon, seuls l'Entreprise et l'intitulé du poste sont obligatoires.~~ _Retiré le 2026-09-27 (trois statuts, ADR 0005)._ |
| BR-001-02 | Toute Candidature a une **Entreprise**, un **intitulé de poste**, une **localisation**, un **type de contrat**, une **source** et une **date de candidature** (tous marqués `*`). La date est pré-remplie avec la date du jour. La description de l'Annonce reste facultative, pour couvrir les candidatures spontanées. _Modifié le 2026-09-26 (maquette), puis le 2026-09-27 (plus de Brouillon : ces champs sont toujours obligatoires)._ |
| BR-001-03 | La date de candidature ne peut pas être dans le futur. |
| BR-001-04 | Salaire : `salaryMin` ≤ `salaryMax` quand les deux sont saisis ; dès qu'un montant est saisi, la devise et la période sont obligatoires. Devise par défaut : EUR. |

### Cycle de vie

| ID | Règle |
|---|---|
| BR-001-05 | Transitions autorisées — toute autre transition est refusée : |

| Depuis | Vers |
|---|---|
| Postulée | Entretien, Refusée |
| Entretien | Refusée |
| Refusée | — (définitive) |

Aucun retour en arrière. Une embauche laisse la Candidature en **Entretien** ; une Entreprise qui revient après un refus donne lieu à une nouvelle Candidature.

| ID | Règle |
|---|---|
| BR-001-06 | ~~Un Brouillon abandonné ne se classe pas : il se supprime.~~ _Retiré le 2026-09-27 (trois statuts, ADR 0005)._ |
| BR-001-07 | En Phase 1, le passage en **Entretien** est manuel. Le passage automatique à l'ajout d'un entretien relève de SPEC-003. |
| BR-001-08 | Une Proposition reçue et en attente de réponse ne change pas le statut : la Candidature reste en **Entretien** ; la date limite se note dans les notes. |
| BR-001-09 | La date d'un changement de statut est l'instant où je l'enregistre ; pas de saisie d'une date passée (« refusée il y a 3 jours ») en Phase 1. _Hypothèse H2 confirmée le 2026-09-28._ |
| BR-001-10 | Une Candidature **Refusée** reste modifiable (notes, champs de l'Annonce) ; seul son statut est figé. |

### Entreprise

| ID | Règle |
|---|---|
| BR-001-11 | Le nom d'une Entreprise est unique **sans distinction de casse** et après suppression des espaces en début et fin (« Capgemini » = « capgemini » = « Capgemini  »). |
| BR-001-12 | Supprimer une Candidature ne supprime pas son Entreprise, même si c'était la dernière Candidature liée. _Hypothèse H3 confirmée le 2026-09-30._ |

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
| salaryCurrency | `EUR`, `CHF`, `GBP` ou `USD` | si montant | défaut `EUR` |
| salaryPeriod | enum `YEARLY` / `MONTHLY` | si montant | |
| appliedAt | date (sans heure) | si Postulée ou au-delà | BR-001-02, BR-001-03 |
| notes | texte long | non | ≤ 20 000 caractères |
| createdAt, updatedAt | horodatage | oui | |

### Attachment — Pièce jointe

_Ajouté le 2026-09-28 (remplace les champs texte `cvLabel` et `coverLetter`) — [ADR 0006](../docs/adr/0006-pieces-jointes-sur-uploadthing.md)._

| Champ | Type | Obligatoire | Contraintes |
|---|---|---|---|
| id | identifiant | oui | |
| userId | → User | oui | |
| applicationId | → Application | oui | suppression en cascade |
| kind | enum `AttachmentKind` (`CV`, `COVER_LETTER`) | oui | au plus une par type et par Candidature |
| fileKey | texte | oui | clé UploadThing, unique |
| url | URL | oui | URL du fichier chez UploadThing |
| name | texte | oui | nom d'origine du fichier |
| size | entier | oui | octets, ≤ 4 Mo |
| createdAt | horodatage | oui | |

Le fichier lui-même n'est jamais stocké dans PostgreSQL.

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
| `ApplicationStatus` | `APPLIED`, `INTERVIEW`, `REJECTED` |
| `ContractType` | `CDI`, `CDD`, `INTERNSHIP` (stage), `APPRENTICESHIP` (alternance), `GRADUATE_PROGRAM`, `FREELANCE`, `TEMPORARY` (intérim), `OTHER` |
| `ApplicationSource` | `LINKEDIN`, `INDEED`, `WELCOME_TO_THE_JUNGLE`, `APEC`, `FRANCE_TRAVAIL`, `COMPANY_WEBSITE` (site carrière), `SCHOOL` (école), `REFERRAL` (réseau / cooptation), `SPONTANEOUS` (candidature spontanée), `OTHER` |

Codes en anglais dans la base et le code ; libellés en français dans l'interface.

## 8. Expérience utilisateur

| Page | Contenu |
|---|---|
| `/applications` | Liste : Entreprise, poste, localisation, contrat, source, date de candidature, statut (badge) ; chaque ligne ouvre la fiche. Au-dessus, une barre (formulaire GET) : recherche partielle sans casse sur l'Entreprise, le poste et la localisation ; statuts en cases à cocher ; contrat et source ; tri (dernière modification par défaut, date de candidature, Entreprise A → Z) ; « Filtrer » et « Réinitialiser ». Filtres et page dans l'adresse (`?q=&statut=&contrat=&source=&tri=&page=`) ; une valeur inconnue est ignorée. Pagination par 25 (« Page N sur M · X candidatures », Précédent / Suivant), absente s'il n'y a qu'une page ; une page trop grande affiche la dernière. États vides : « Aucune candidature pour l'instant » ou, avec des filtres, « Aucune candidature ne correspond. » + « Réinitialiser les filtres ». |
| Fenêtre « Nouvelle candidature » | Ouverte depuis le bouton de la barre du haut, sur toutes les pages. Un seul bouton « Enregistrer » : la Candidature est créée Postulée, puis la fenêtre se ferme. Deux champs fichier facultatifs, CV et lettre de motivation (PDF, 4 Mo maximum) ; en cas d'échec d'envoi ou d'enregistrement, un message dit ce qui a été fait des fichiers (supprimés, ou restés sur UploadThing). Légende : `*` requis. Date de candidature pré-remplie avec la date du jour. Champ Entreprise avec autocomplétion et option « Créer « … » ». |
| `/applications/new` | Même formulaire en pleine page, pour un accès direct par URL. |
| `/applications/[id]` | Détail : champs, description de l'Annonce en texte brut (retours à la ligne conservés), lien vers l'Annonce ouvert dans un nouvel onglet, historique des statuts (le plus récent en haut), actions « Changer le statut », « Modifier », « Supprimer ». |
| Fenêtre « Modifier — <Entreprise> » | Ouverte par le bouton « Modifier » de la fiche (pas de page `/edit`, décision du 2026-09-28). Même formulaire que la création, pré-rempli, sans le statut. Pièces jointes : le fichier actuel s'affiche avec « Retirer » et « Remplacer par… » ; rien choisi = on garde. Les anciens fichiers ne sont supprimés d'UploadThing qu'après l'enregistrement ; si cette suppression échoue, la modification reste faite et la fenêtre reste ouverte pour nommer le fichier à supprimer. |

- **Changer le statut** : un bloc « Statut » sur la fiche, avec **un bouton par transition autorisée** depuis le statut courant (« Passer en Entretien », « Marquer Refusée ») — pas de menu déroulant, décision du 2026-09-28 d'après la maquette. Vers Refusée, une fenêtre de confirmation indique que le changement est définitif. Depuis Refusée, aucun bouton : la mention « Statut définitif ». Si le statut a changé entre-temps (autre onglet), le serveur refuse et invite à recharger.
- **Supprimer** : bouton sur la fiche, à côté de « Modifier ». Une fenêtre de confirmation rappelle le poste et l'Entreprise et précise que l'action est irréversible ; « Annuler » ne supprime rien. La Candidature, son historique et ses pièces jointes sont supprimés en base, **puis** les fichiers chez UploadThing ; retour à la liste. Si un fichier ne peut pas être supprimé chez UploadThing, la fenêtre reste ouverte et le nomme (la Candidature, elle, est supprimée).
- **Erreurs de validation** : affichées sous le champ concerné, sans perdre la saisie.
- **Candidature introuvable** (id inexistant) : page 404.
- Interface en français.

## 9. Critères d'acceptation

| ID | Étant donné | Quand | Alors |
|---|---|---|---|
| AC-001-01 | aucune Entreprise « Thales » | je crée une Candidature complète chez « Thales » pour le poste « Dev Backend » | la Candidature est créée Postulée, l'Entreprise « Thales » est créée, l'historique contient une entrée `— → APPLIED` |
| AC-001-02 | le formulaire de création | je crée une Candidature sans intitulé de poste | la création est refusée avec un message sur le champ intitulé |
| AC-001-03 | le formulaire de création | je crée une Candidature en vidant la date de candidature | la création est refusée avec un message sur le champ date |
| AC-001-04 | l'Entreprise « Capgemini » existe | je crée une Candidature en tapant « capgemini » | elle est rattachée à l'Entreprise existante ; aucune nouvelle Entreprise n'est créée |
| AC-001-05 | une Candidature Postulée | je la passe en Entretien | le statut devient Entretien et l'historique contient `APPLIED → INTERVIEW` avec l'horodatage |
| AC-001-06 | une Candidature en Entretien | je demande la transition vers Postulée | la transition est refusée côté serveur, même si la requête est forgée hors de l'interface |
| AC-001-07 | une Candidature Refusée | j'ouvre le menu « Changer le statut » | aucune transition n'est proposée |
| AC-001-08 | une Candidature Refusée | j'envoie directement une requête de transition vers Postulée | la transition est refusée côté serveur |
| AC-001-09 | ~~une Candidature Classée, je la rouvre~~ | _Retiré le 2026-09-27 (trois statuts, ADR 0005)._ | — |
| AC-001-10 | le formulaire de création | je l'ouvre | la date de candidature vaut la date du jour ; après enregistrement, `appliedAt` vaut cette date |
| AC-001-11 | une Candidature Refusée | je modifie ses notes | la modification est enregistrée ; le statut reste Refusée |
| AC-001-12 | une Candidature avec 3 changements de statut | je la supprime et confirme | la Candidature et ses 3 entrées d'historique n'existent plus ; son Entreprise existe toujours |
| AC-001-13 | une Candidature | je clique sur Supprimer puis annule | rien n'est supprimé |
| AC-001-14 | 2 Candidatures Postulée et 1 Refusée | j'ouvre la liste | les 3 Candidatures s'affichent |
| AC-001-15 | les mêmes Candidatures | je filtre sur le statut Refusée | seule la Candidature Refusée s'affiche |
| AC-001-16 | des Candidatures chez « Thales » et « Airbus » | je recherche « thal » | seules les Candidatures chez Thales s'affichent |
| AC-001-17 | une saisie de salaire min 50 000 et max 40 000 | j'enregistre | l'enregistrement est refusé avec un message sur le salaire |
| AC-001-18 | une URL d'Annonce `javascript:alert(1)` | j'enregistre | l'enregistrement est refusé : seules les URL `http`/`https` sont acceptées |
| AC-001-19 | une description d'Annonce contenant `<script>alert(1)</script>` | j'affiche la Candidature | le texte s'affiche tel quel, rien n'est exécuté |
| AC-001-20 | un id de Candidature inexistant | j'ouvre `/applications/[id]` | j'obtiens une page 404 |
| AC-001-21 | 30 Candidatures | j'ouvre la liste | 25 s'affichent, avec un accès à la page suivante |

### Couverture par les tests (clôture du 2026-09-30)

Chaque critère est vérifié par un test qui cite son identifiant (dossier `src/modules/applications/`).

| Critère | Test(s) |
|---|---|
| AC-001-01 | `service.integration.test.ts` |
| AC-001-02, 03, 17, 18 | `schemas.test.ts` |
| AC-001-04 | `service.integration.test.ts` |
| AC-001-05 | `domain/status.test.ts`, `status-change.integration.test.ts` |
| AC-001-06 | `status-change.integration.test.ts` |
| AC-001-07 | `domain/status.test.ts`, `components/status-panel.test.tsx` |
| AC-001-08 | `domain/status.test.ts`, `status-change.integration.test.ts` |
| AC-001-09 | _Retiré (ADR 0005)_ |
| AC-001-10 | `components/application-form.test.tsx`, `service.integration.test.ts` |
| AC-001-11 | `update.integration.test.ts` |
| AC-001-12 | `delete.integration.test.ts` |
| AC-001-13 | `components/delete-application-button.test.tsx` |
| AC-001-14, 15, 16, 21 | `list.integration.test.ts` |
| AC-001-19 | `components/application-detail.test.tsx` |
| AC-001-20 | `service.integration.test.ts` (id inconnu et id mal formé → introuvable, traduit en page 404 par la fiche) |
| FR-001-04 (suggestions) | `companies/service.integration.test.ts`, `components/application-form.test.tsx` — livrée à la clôture (2026-09-30) : liste native `<datalist>` des Entreprises existantes, un nouveau nom reste possible |

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

## 11. Sécurité

- **Accès** : l'application n'est joignable que via Tailscale (ADR `0001`) ; pas d'authentification applicative en Phase 1. Toutes les requêtes sont néanmoins filtrées par `userId`.
- **Validation** : toute entrée est validée **côté serveur** par des schémas Zod, y compris les transitions de statut. La validation côté client n'est qu'un confort.
- **XSS** : la description et les notes sont affichées en texte brut, jamais interprétées comme du HTML ou du Markdown.
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

Chaque test cite l'identifiant du critère qu'il couvre (ex. `it("AC-001-06 refuse INTERVIEW → APPLIED", …)`).

---

## Points à valider en revue

| # | Hypothèse | Alternative |
|---|---|---|
| H1 | ~~Description de l'Annonce facultative, même en Postulée~~ — tranché par la maquette : facultative | — |
| H2 | ~~Pas de saisie d'une date passée pour un changement de statut (BR-001-09)~~ — confirmée le 2026-09-28 : l'instant de l'enregistrement | — |
| H3 | ~~L'Entreprise reste après suppression de sa dernière Candidature (BR-001-12)~~ — confirmée le 2026-09-30 | — |
| H4 | ~~Listes `ContractType` et `ApplicationSource`~~ — tranché par la maquette (ajout de Graduate Program et École) | — |
| H5 | ~~Pagination par 25 (FR-001-12)~~ — confirmée le 2026-09-30 | — |
