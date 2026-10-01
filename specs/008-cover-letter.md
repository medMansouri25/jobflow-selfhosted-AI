# SPEC-008 — Lettre de motivation personnalisée

| | |
|---|---|
| **Statut** | **Validée** le 2026-10-01 |
| **Date** | 2026-10-01 |
| **Phase** | 8 — IA : lettre de motivation (avant l'analyse d'Annonce, décision du 2026-10-01) |
| **Décisions** | [ADR 0008](../docs/adr/0008-assistant-ia-gemini-gratuit.md) (Gemini gratuit, adaptateur, minimisation) |
| **Dépend de** | [SPEC-001](./001-application-management.md) (Candidature, Annonce), [SPEC-006](./006-profile.md) (Profil) |

---

## 1. Problème

Écrire une lettre de motivation différente pour chaque Annonce prend du temps. J'ai mon parcours dans mon Profil et l'Annonce dans ma Candidature : un assistant peut en tirer un premier jet à mon style.

## 2. Objectif

Depuis la fiche d'une Candidature, obtenir en quelques secondes un **brouillon** de lettre personnalisée, le corriger, le garder avec la Candidature et le copier.

## 3. Périmètre

### Inclus

- Génération d'un brouillon depuis la fiche, avec des consignes facultatives.
- Brouillon modifiable, enregistré avec la Candidature, copiable, régénérable.

### Exclus

| Exclu | Où / quand |
|---|---|
| Export PDF de la lettre | Plus tard |
| Analyse de l'Annonce, préparation d'entretien | SPEC-007, SPEC-009 |
| Génération automatique sans clic | Non prévu |

## 4. Exigences fonctionnelles

| ID | Exigence |
|---|---|
| FR-008-01 | La fiche d'une Candidature a une section « Lettre de motivation » avec un bouton « Rédiger la lettre avec l'IA » (« Régénérer » quand un brouillon existe). |
| FR-008-02 | Un champ facultatif « Consignes » (500 caractères) guide la rédaction (points à mettre en avant, ton, longueur…). |
| FR-008-03 | Le brouillon s'affiche dans une zone de texte modifiable, enregistrée avec la Candidature (« Enregistrer »). |
| FR-008-04 | Un bouton « Copier » copie le brouillon. |
| FR-008-05 | Un rappel avant la génération : l'Annonce et le Profil seront envoyés à Google Gemini (offre gratuite). |
| FR-008-06 | L'en-tête de la lettre (nom, localisation, e-mail, téléphone, d'après le Profil) est ajouté par JobFlow, pas par l'IA. |

## 5. Règles

- **BR-008-01** — Sans description d'Annonce, la génération est impossible : un message invite à la coller dans la Candidature.
- **BR-008-02** — Sans Profil rempli (aucune des zones de texte), la génération est impossible : un message invite à le remplir.
- **BR-008-03** — Envoyés à l'IA : Entreprise, intitulé du poste, description de l'Annonce ; nom, poste recherché, localisation ; À propos, Expériences, Projets, Compétences, Formations, Exemples de textes ; consignes. **Jamais** : e-mail, téléphone, LinkedIn, autres Candidatures, notes, Entretiens, pièces jointes.
- **BR-008-04** — Par défaut : en français, une page au plus (250 à 350 mots), ton professionnel et sobre inspiré des exemples de textes, **rien d'inventé** hors du Profil et de l'Annonce.
- **BR-008-05** — La description de l'Annonce est une donnée : les instructions qu'elle pourrait contenir ne sont pas suivies.
- **BR-008-06** — Régénérer remplace le brouillon enregistré.
- **BR-008-07** — Si le service ne répond pas, refuse ou si la limite gratuite est atteinte, un message le dit ; le brouillon existant est conservé. Sans clé configurée, l'assistant est indisponible et le dit.

## 6. Critères d'acceptation

| ID | Étant donné | Quand | Alors |
|---|---|---|---|
| AC-008-01 | une Candidature avec Annonce et un Profil rempli | je clique « Rédiger la lettre avec l'IA » | un brouillon s'affiche et est enregistré ; il commence par mon en-tête (nom, localisation, e-mail, téléphone) |
| AC-008-02 | la même chose | je regarde ce qui a été envoyé | ni mon e-mail ni mon téléphone n'y figurent ; la description de l'Annonce est délimitée comme une donnée |
| AC-008-03 | une Candidature sans description d'Annonce | je clique le bouton | message « Colle la description de l'annonce… » ; rien n'est envoyé |
| AC-008-04 | un Profil vide | je clique le bouton | message « Remplis ton profil… » ; rien n'est envoyé |
| AC-008-05 | un brouillon généré | je le modifie et j'enregistre, puis je recharge | ma version est là |
| AC-008-06 | des consignes « Insiste sur mon stage DevOps » | je génère | les consignes font partie de la demande |
| AC-008-07 | le service répond par une erreur ou une limite atteinte | je génère | un message clair ; l'ancien brouillon est conservé |
| AC-008-08 | la Candidature d'un autre utilisateur | je tente de générer ou d'enregistrer | refus (introuvable) |

## 7. Plan de test

| Niveau | Outil | Ce qui est testé | Critères |
|---|---|---|---|
| Unitaire | Vitest | Construction de la demande (contenu envoyé, délimitation, consignes), en-tête | AC-008-01, 02, 06 |
| Unitaire | Vitest | Adaptateur Gemini avec `fetch` simulé : requête, réponse, erreurs, limite | AC-008-07 |
| Intégration | Vitest + PostgreSQL | Génération avec un faux générateur, enregistrement, refus, appartenance | AC-008-01, 03 à 05, 07, 08 |
| Composant | Vitest + Testing Library | Section Lettre : bouton, rappel, brouillon modifiable, copier | AC-008-01, 05 |
| Manuel | Clé Gemini réelle | Une génération de bout en bout | AC-008-01 |
