# SPEC-006 — Profil

| | |
|---|---|
| **Statut** | **Validée** le 2026-10-01 |
| **Date** | 2026-10-01 |
| **Phase** | 6 — Profil |
| **Dépend de** | [SPEC-000](./000-product-vision.md) |
| **Prépare** | La lettre de motivation personnalisée par Annonce (SPEC-008), puis l'analyse d'Annonce (SPEC-007) |

---

## 1. Problème

Pour écrire une lettre de motivation personnalisée à chaque Annonce, l'assistant IA aura besoin de savoir qui je suis : mon parcours, mes compétences, mes projets, et comment j'écris. Aujourd'hui, rien de tout ça n'est dans JobFlow.

## 2. Objectif

Une page **Profil** que je remplis une fois (souvent par copier-coller de mon CV) et que je mets à jour quand mon parcours évolue.

## 3. Périmètre

### Inclus

- Une page « Profil » (menu) : quelques champs courts et six zones de texte libre.
- Un seul profil, celui de l'utilisateur.

### Exclus

| Exclu | Où / quand |
|---|---|
| Fiches structurées (une par expérience, formation…) | Plus tard si besoin (décision du 2026-10-01 : texte libre) |
| Remplissage automatique depuis un CV PDF | Après l'arrivée de l'IA |
| Envoi du profil à un service d'IA | SPEC-008 (décision et ADR sur le fournisseur) |
| Bibliothèque de documents (SPEC-005) | Abandonnée le 2026-10-01 : une pièce jointe par Candidature suffit |

## 4. Exigences fonctionnelles

| ID | Exigence |
|---|---|
| FR-006-01 | La page « Profil » affiche le profil enregistré, ou un formulaire vide la première fois. |
| FR-006-02 | Champs courts, tous facultatifs : nom complet, poste recherché, localisation, e-mail, téléphone, profil LinkedIn. |
| FR-006-03 | Zones de texte libre, toutes facultatives : À propos de moi, Expériences, Projets, Compétences, Formations, Exemples de textes écrits par moi. |
| FR-006-04 | Un bouton « Enregistrer » sauvegarde tout le profil ; un message confirme l'enregistrement. |
| FR-006-05 | Après une erreur de validation, la saisie est conservée et l'erreur est affichée sous le champ concerné. |

## 5. Règles

- **BR-006-01** — Un seul profil par utilisateur ; le premier enregistrement le crée, les suivants le remplacent.
- **BR-006-02** — Un champ vidé est effacé.
- **BR-006-03** — E-mail : adresse valide. LinkedIn : lien `http(s)://`. Champs courts : 200 caractères max (téléphone 40, lien LinkedIn 2 048 comme le lien d'une Annonce). Zones de texte : 20 000 caractères max chacune.
- **BR-006-04** — Les textes sont affichés tels quels (texte brut) ; ils ne quittent jamais la Pi tant que l'IA n'est pas branchée.

## 6. Critères d'acceptation

| ID | Étant donné | Quand | Alors |
|---|---|---|---|
| AC-006-01 | aucun profil | j'ouvre « Profil » | le formulaire est vide |
| AC-006-02 | aucun profil | je saisis mon nom et colle mes expériences, puis j'enregistre | « Profil enregistré. » ; en rouvrant la page, les valeurs sont là |
| AC-006-03 | un profil avec un téléphone | je vide le téléphone et j'enregistre | le téléphone est effacé, le reste est inchangé |
| AC-006-04 | le formulaire | j'enregistre l'e-mail « pas-un-email » ou le LinkedIn « linkedin.com/in/moi » | refus, message sous le champ, saisie conservée |
| AC-006-05 | le profil d'un autre utilisateur | j'ouvre « Profil » | je ne vois que le mien |

## 7. Plan de test

| Niveau | Outil | Ce qui est testé | Critères |
|---|---|---|---|
| Unitaire | Vitest | Schéma : champs facultatifs, e-mail, lien, longueurs | AC-006-04 |
| Intégration | Vitest + PostgreSQL | Création puis remplacement, champ vidé, un profil par utilisateur | AC-006-02, 03, 05 |
| Composant | Vitest + Testing Library | Formulaire vide / pré-rempli, erreur sous le champ, message de confirmation | AC-006-01, 02, 04 |
