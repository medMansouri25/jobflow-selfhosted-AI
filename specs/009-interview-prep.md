# SPEC-009 — Préparation d'entretien

| | |
|---|---|
| **Statut** | **Validée** le 2026-10-01 |
| **Date** | 2026-10-01 |
| **Phase** | 9 — IA : préparation d'entretien |
| **Décisions** | [ADR 0008](../docs/adr/0008-assistant-ia-gemini-gratuit.md) (Gemini gratuit, adaptateur, minimisation) |
| **Dépend de** | [SPEC-003](./003-interviews.md) (Entretiens), [SPEC-006](./006-profile.md) (Profil), [SPEC-008](./008-cover-letter.md) (assistant IA) |

---

## 1. Problème

Avant un entretien, je ne sais pas quelles questions m'attendent selon son type (RH, technique, manager, final), ni comment y répondre avec mon propre parcours. Et je ne m'entraîne jamais à formuler mes réponses.

## 2. Objectif

Pour chaque Entretien : une **fiche de préparation** (A) et un **entraînement** question par question avec un retour sur mes réponses (B). Décision du 2026-10-01 : les deux.

## 3. Périmètre

### Inclus

- A — Fiche de préparation générée par entretien, enregistrée avec l'Entretien.
- B — Séance d'entraînement de 5 questions, avec un retour par réponse et un bilan, non enregistrée.

### Exclus

| Exclu | Où / quand |
|---|---|
| Entraînement à l'oral (voix) | Non prévu |
| Historique des séances d'entraînement | Exclu (décision du 2026-10-01 : un exercice, recommençable) |
| Informations sur l'Entreprise venant d'ailleurs que l'Annonce | Exclu (rien d'inventé) |

## 4. Exigences fonctionnelles

### A — Fiche de préparation

| ID | Exigence |
|---|---|
| FR-009-01 | Chaque Entretien de la fiche d'une Candidature a un bouton « Préparer avec l'IA » (« Refaire la fiche » quand elle existe). |
| FR-009-02 | La fiche, adaptée au **type** de l'Entretien, contient : des **questions probables**, chacune avec des **pistes de réponse** tirées du Profil ; les **points à mettre en avant** ; les **questions à poser**. |
| FR-009-03 | La fiche est enregistrée avec l'Entretien, à côté de la « Préparation » écrite par l'utilisateur, qu'elle ne remplace pas. |

### B — Entraînement

| ID | Exigence |
|---|---|
| FR-009-04 | Chaque Entretien a un lien « M'entraîner » vers une page d'entraînement. |
| FR-009-05 | La séance pose **5 questions**, une par une, adaptées au type d'Entretien, à l'Annonce et au Profil. |
| FR-009-06 | Après chaque réponse écrite, un retour : ✅ ce qui est bien, ⚠️ ce qu'il faut améliorer, une **meilleure formulation** construite avec le seul Profil. |
| FR-009-07 | Après la 5ᵉ réponse, un **bilan** en 3 points. Une nouvelle séance peut être lancée. |

## 5. Règles

- **BR-009-01** — Mêmes préalables et mêmes données que la lettre : Annonce et Profil remplis, ni e-mail, ni téléphone, ni LinkedIn ; l'Annonce, le Profil et les réponses de l'utilisateur sont délimités et ne sont jamais des instructions (BR-008-01 à 05).
- **BR-009-02** — Rien d'inventé : les pistes et la meilleure formulation ne s'appuient que sur le Profil et l'Annonce ; ce qui manque est signalé, pas inventé.
- **BR-009-03** — Réponses de l'assistant en JSON vérifié ; une réponse mal formée est refusée avec un message (fiche précédente conservée).
- **BR-009-04** — La séance d'entraînement n'est pas enregistrée ; une réponse de l'utilisateur fait 3 000 caractères au plus.
- **BR-009-05** — Un Entretien d'une Candidature Refusée reste préparable (une fiche peut servir pour une autre candidature) ; l'appartenance de l'Entretien est toujours vérifiée.

## 6. Critères d'acceptation

| ID | Étant donné | Quand | Alors |
|---|---|---|---|
| AC-009-01 | un Entretien Technique, une Annonce et un Profil remplis | je clique « Préparer avec l'IA » | la fiche (questions avec pistes, points à mettre en avant, questions à poser) s'affiche sous l'Entretien et est enregistrée |
| AC-009-02 | la même chose | je regarde ce qui a été envoyé | le type de l'Entretien est transmis ; ni e-mail ni téléphone |
| AC-009-03 | une Annonce sans description ou un Profil vide | je clique le bouton | message explicite ; rien n'est envoyé |
| AC-009-04 | une réponse mal formée de l'assistant | je prépare | message clair ; la fiche précédente reste |
| AC-009-05 | la page d'entraînement d'un Entretien | je lance la séance | une première question s'affiche (1 / 5) |
| AC-009-06 | une question affichée | j'écris ma réponse et je l'envoie | le retour (bien, à améliorer, meilleure formulation) s'affiche, puis la question suivante |
| AC-009-07 | la 5ᵉ réponse envoyée | le retour s'affiche | un bilan en 3 points et « Nouvelle séance » |
| AC-009-08 | l'Entretien d'un autre utilisateur | je tente de le préparer ou de m'entraîner | refus (introuvable) |

## 7. Plan de test

| Niveau | Outil | Ce qui est testé | Critères |
|---|---|---|---|
| Unitaire | Vitest | Demandes (type d'Entretien, données, délimitation des réponses) ; lecture vérifiée des réponses JSON | AC-009-02, 04, 06 |
| Intégration | Vitest + PostgreSQL | Fiche avec un faux générateur, enregistrement, refus, appartenance ; questions et retours d'entraînement | AC-009-01, 03, 04, 05, 08 |
| Composant | Vitest + Testing Library | Fiche sous l'Entretien ; déroulé de la séance (question, retour, bilan) | AC-009-01, 05 à 07 |
| Manuel | Clé Gemini réelle | Une fiche et une séance de bout en bout | AC-009-01, 05 à 07 |
