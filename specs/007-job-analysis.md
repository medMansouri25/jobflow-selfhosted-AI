# SPEC-007 — Analyse d'une Annonce

| | |
|---|---|
| **Statut** | **Validée** le 2026-10-01 |
| **Date** | 2026-10-01 |
| **Phase** | 7 — IA : analyse d'une Annonce (après la lettre de motivation, décision du 2026-10-01) |
| **Décisions** | [ADR 0008](../docs/adr/0008-assistant-ia-gemini-gratuit.md) (Gemini gratuit, adaptateur, minimisation) |
| **Dépend de** | [SPEC-001](./001-application-management.md) (Annonce), [SPEC-006](./006-profile.md) (Profil), [SPEC-008](./008-cover-letter.md) (assistant IA) |

---

## 1. Problème

Avant de postuler ou de passer un entretien, je relis l'Annonce pour comprendre ce qui compte vraiment, quelles compétences sont demandées, ce que j'ai déjà et ce qui me manque. C'est long, et je rate des choses.

## 2. Objectif

Depuis la fiche d'une Candidature, obtenir une **analyse** de l'Annonce au regard de mon Profil, enregistrée avec la Candidature.

## 3. Périmètre

### Inclus

- Bouton « Analyser l'annonce » (« Relancer l'analyse » ensuite), résultat enregistré et affiché sur la fiche.

### Exclus

| Exclu | Où / quand |
|---|---|
| Note ou pourcentage de compatibilité | Exclu (décision du 2026-10-01 : fausse précision) |
| Informations sur l'Entreprise venant d'ailleurs que l'Annonce | Exclu (pas de recherche web, rien d'inventé) |
| Préparation d'entretien détaillée | SPEC-009 |

## 4. Exigences fonctionnelles

| ID | Exigence |
|---|---|
| FR-007-01 | La fiche d'une Candidature a une section « Analyse de l'annonce » avec un bouton « Analyser l'annonce » (« Relancer l'analyse » quand une analyse existe). |
| FR-007-02 | **En bref** : 2 ou 3 phrases sur le poste et ce qui compte vraiment. |
| FR-007-03 | **Compétences demandées pour le poste**, séparées en **techniques** et **savoir-être** ; chacune marquée **obligatoire** ou **souhaitée** selon l'Annonce, et ✅ « dans ton profil » ou ⚠️ « à renforcer ». |
| FR-007-04 | **Tes atouts pour ce poste** : éléments du Profil à mettre en avant. |
| FR-007-05 | **Questions à préparer** (probables en entretien) et **questions à poser** au recruteur. |
| FR-007-06 | Le même rappel que la lettre avant l'envoi : l'Annonce et le Profil partent chez Google Gemini (offre gratuite). |

## 5. Règles

- **BR-007-01** — Mêmes préalables que la lettre : description d'Annonce et Profil rempli (BR-008-01, 02).
- **BR-007-02** — Mêmes données envoyées que la lettre, sans e-mail, téléphone ni LinkedIn (BR-008-03) ; l'Annonce est délimitée et ses éventuelles instructions ne sont pas suivies (BR-008-05).
- **BR-007-03** — Rien d'inventé : seules l'Annonce et le Profil comptent ; une compétence n'est ✅ que si le Profil la mentionne.
- **BR-007-04** — L'assistant répond dans un format structuré (JSON vérifié) ; une réponse mal formée est refusée avec un message, l'analyse précédente est conservée.
- **BR-007-05** — Relancer l'analyse remplace la précédente.

## 6. Critères d'acceptation

| ID | Étant donné | Quand | Alors |
|---|---|---|---|
| AC-007-01 | une Candidature avec Annonce et un Profil rempli | je clique « Analyser l'annonce » | les cinq rubriques s'affichent et sont enregistrées avec la Candidature |
| AC-007-02 | une analyse | je regarde les compétences | techniques et savoir-être sont séparés ; chacune porte « obligatoire » / « souhaitée » et ✅ / ⚠️ |
| AC-007-03 | une Candidature sans description d'Annonce, ou un Profil vide | je clique le bouton | message explicite ; rien n'est envoyé |
| AC-007-04 | l'assistant renvoie un texte qui n'est pas l'analyse attendue | j'analyse | message clair ; l'analyse précédente reste affichée |
| AC-007-05 | la même chose que AC-007-01 | je regarde ce qui a été envoyé | ni e-mail ni téléphone ; l'Annonce est délimitée |
| AC-007-06 | la Candidature d'un autre utilisateur | je tente de l'analyser | refus (introuvable) |

## 7. Plan de test

| Niveau | Outil | Ce qui est testé | Critères |
|---|---|---|---|
| Unitaire | Vitest | Demande (données, délimitation) ; lecture et validation de la réponse JSON | AC-007-04, 05 |
| Intégration | Vitest + PostgreSQL | Analyse avec un faux générateur, enregistrement, refus, appartenance | AC-007-01, 03, 04, 06 |
| Composant | Vitest + Testing Library | Affichage des rubriques, compétences marquées | AC-007-01, 02 |
| Manuel | Clé Gemini réelle | Une analyse de bout en bout | AC-007-01 |
