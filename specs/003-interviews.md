# SPEC-003 — Entretiens

| | |
|---|---|
| **Statut** | **Validée** le 2026-10-01 |
| **Date** | 2026-10-01 |
| **Phase** | 3 — Entretiens |
| **Vocabulaire** | `CONTEXT.md` fait foi (Entretien en tant que rendez-vous, Interlocuteur, Préparation, Compte rendu) |
| **Dépend de** | [SPEC-001](./001-application-management.md) (Candidature, statuts, historique), [SPEC-002](./002-dashboard.md) (tableau de bord) |

---

## 1. Problème

Une invitation à un entretien arrive, puis un deuxième, puis un troisième. Je ne retrouve plus quand ils ont lieu, avec qui, ce que je voulais préparer, ni comment ça s'est passé. Et je dois penser à passer la Candidature en « Entretien » à la main.

## 2. Objectif

Noter chaque **Entretien** d'une Candidature (date, type, format, lieu, interlocuteur, préparation, compte rendu), voir mes **prochains entretiens** dès l'ouverture de JobFlow, et que la Candidature passe en « Entretien » toute seule.

## 3. Périmètre

### Inclus

- Ajouter, modifier, supprimer un Entretien depuis la fiche d'une Candidature.
- Passage automatique de la Candidature au statut Entretien.
- « Prochains entretiens » sur le tableau de bord.
- Page « Entretiens » : à venir, puis passés.

### Exclus

| Exclu | Où / quand |
|---|---|
| Fiches Contact (personne réutilisable par Entreprise) | Plus tard (décision du 2026-10-01) : l'Interlocuteur est du texte libre |
| Vue calendrier semaine / mois | SPEC-004 (Agenda) |
| Rappels, notifications, export calendrier (.ics) | Non prévu |
| Fuseau horaire autre que Paris | Non prévu |

## 4. User stories

| ID | En tant qu'utilisateur, je veux… | …afin de… |
|---|---|---|
| US-003-01 | ajouter un Entretien à une Candidature | savoir quand et comment il a lieu |
| US-003-02 | noter ma préparation avant et mon compte rendu après | arriver préparé et garder une trace |
| US-003-03 | modifier ou supprimer un Entretien | corriger un horaire décalé ou une erreur |
| US-003-04 | que la Candidature passe en Entretien quand j'ajoute un entretien | ne pas avoir à le faire à la main |
| US-003-05 | voir mes prochains entretiens sur le tableau de bord | ne rater aucun rendez-vous |
| US-003-06 | voir tous mes entretiens, à venir et passés | retrouver un entretien sans chercher la Candidature |

## 5. Exigences fonctionnelles

| ID | Exigence |
|---|---|
| FR-003-01 | Ajouter un Entretien depuis la fiche d'une Candidature (fenêtre modale « Ajouter un entretien »). |
| FR-003-02 | Modifier tous les champs d'un Entretien. |
| FR-003-03 | Supprimer un Entretien après confirmation. |
| FR-003-04 | La fiche d'une Candidature liste ses Entretiens par date croissante. |
| FR-003-05 | Ajouter un Entretien à une Candidature **Postulée** la passe au statut **Entretien**, avec une entrée dans l'historique des statuts. |
| FR-003-06 | Le tableau de bord affiche les **5 prochains** Entretiens (date et heure à venir), toutes Candidatures confondues, avec un lien vers chaque Candidature. |
| FR-003-07 | La page « Entretiens » (menu) liste les Entretiens **à venir** (du plus proche au plus lointain), puis les **passés** (du plus récent au plus ancien). |

## 6. Règles métier

### Champs

| Champ | Obligatoire | Règle |
|---|---|---|
| Date et heure | oui | Saisies et affichées à l'heure de Paris ; stockées en un seul horodatage UTC. |
| Type | oui | RH, Technique, Manager, Final, Autre. |
| Format | oui | Présentiel, Visio, Téléphone. |
| Lieu ou lien | non | Texte libre, 500 caractères max. Un lien `http(s)://` s'affiche cliquable. |
| Interlocuteur | non | Texte libre, 200 caractères max. |
| Préparation | non | Texte long, affiché en texte brut. |
| Compte rendu | non | Texte long, affiché en texte brut. |

### Statut

- **BR-003-01** — Ajouter un Entretien à une Candidature **Postulée** la passe en **Entretien** dans la même opération (l'Entretien et le changement de statut sont enregistrés ensemble, ou pas du tout).
- **BR-003-02** — Une Candidature déjà en **Entretien** le reste ; aucune nouvelle entrée d'historique.
- **BR-003-03** — Une Candidature **Refusée** n'accepte pas de nouvel Entretien (statut définitif) ; le bouton n'est pas proposé et le serveur refuse. Ses Entretiens existants restent consultables, modifiables et supprimables.
- **BR-003-04** — Modifier ou supprimer un Entretien ne change jamais le statut (aucun retour en arrière).
- **BR-003-05** — Un Entretien peut être daté dans le passé (saisie après coup).
- **BR-003-06** — Supprimer une Candidature supprime ses Entretiens.
- **BR-003-07** — « À venir » = date et heure postérieures à maintenant.

## 7. Critères d'acceptation

| ID | Étant donné | Quand | Alors |
|---|---|---|---|
| AC-003-01 | une Candidature Postulée | j'ajoute un Entretien Technique en visio le 14 oct. à 10 h 30 | l'Entretien apparaît sur la fiche, la Candidature passe en Entretien et l'historique contient `APPLIED → INTERVIEW` |
| AC-003-02 | une Candidature en Entretien | j'ajoute un second Entretien | les deux Entretiens sont listés par date ; le statut et l'historique ne changent pas |
| AC-003-03 | une Candidature Refusée | j'ouvre sa fiche, puis j'envoie quand même une requête d'ajout | aucun bouton « Ajouter un entretien » ; le serveur refuse l'ajout |
| AC-003-04 | le formulaire d'Entretien | j'enregistre sans date, sans type ou sans format | l'enregistrement est refusé avec un message sur le champ concerné |
| AC-003-05 | un Entretien saisi à 10 h 30 (heure de Paris) | je l'affiche | il s'affiche à 10 h 30, en été comme en hiver |
| AC-003-06 | un Entretien | je le modifie, puis je le supprime après confirmation | les changements sont enregistrés, puis il disparaît ; le statut de la Candidature ne change pas |
| AC-003-07 | 7 Entretiens à venir et 2 passés | j'ouvre le tableau de bord | les 5 plus proches sont listés, du plus proche au plus lointain, avec l'Entreprise et un lien vers la Candidature |
| AC-003-08 | des Entretiens à venir et passés | j'ouvre la page « Entretiens » | les à venir d'abord (plus proche en premier), puis les passés (plus récent en premier) |
| AC-003-09 | un Entretien d'un autre utilisateur, ou un identifiant inconnu | je tente de le modifier ou le supprimer | la demande est refusée comme introuvable |
| AC-003-10 | une Candidature avec des Entretiens | je la supprime | ses Entretiens sont supprimés |

## 8. Modèle de données

### Interview — Entretien

| Champ | Type | Contraintes |
|---|---|---|
| id | uuid | clé primaire |
| userId | uuid | → User, cascade |
| applicationId | uuid | → Application, cascade |
| scheduledAt | timestamptz | obligatoire |
| type | `InterviewType` | `HR`, `TECHNICAL`, `MANAGER`, `FINAL`, `OTHER` |
| format | `InterviewFormat` | `ON_SITE`, `VIDEO`, `PHONE` |
| location | varchar(500) | facultatif — adresse ou lien |
| interviewer | varchar(200) | facultatif |
| preparation | text | facultatif |
| debrief | text | facultatif |
| createdAt, updatedAt | timestamptz | |

Index : `(userId, scheduledAt)` pour les prochains Entretiens ; `(applicationId, scheduledAt)` pour la fiche.

## 9. Sécurité

- Tout accès par identifiant vérifie l'appartenance à l'utilisateur (même règle que `findOwnedApplication`).
- Validation côté serveur (Zod) ; la préparation et le compte rendu sont affichés en texte brut.
- Un lien n'est rendu cliquable que s'il commence par `http://` ou `https://`, avec `rel="noopener noreferrer"`.

## 10. Plan de test

| Niveau | Outil | Ce qui est testé | Critères couverts |
|---|---|---|---|
| Unitaire | Vitest | Schéma : champs obligatoires, longueurs ; conversion heure de Paris ↔ UTC (été / hiver) | AC-003-04, 05 |
| Intégration | Vitest + PostgreSQL | Ajout avec passage de statut, refus sur Refusée, modification, suppression, appartenance, cascade, prochains / passés | AC-003-01 à 03, 06 à 10 |
| Composant | Vitest + Testing Library | Section Entretiens de la fiche, bouton absent sur Refusée, panneau du tableau de bord | AC-003-03, 07 |

Chaque test cite l'identifiant du critère qu'il couvre.
