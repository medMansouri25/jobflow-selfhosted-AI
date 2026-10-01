# Task: Lettre de motivation personnalisée (T8.2, avec T7.3 client IA)

**Status**: Completed
**Type**: Full-stack + service externe
**Created**: 2026-10-01

## Problem
Écrire une lettre différente pour chaque Annonce prend du temps ; le Profil et l'Annonce sont déjà dans JobFlow (SPEC-008).

## Outcome
Sur la fiche : consignes facultatives, rappel de ce qui part chez Google, bouton « Rédiger la lettre avec l'IA » / « Régénérer » ; brouillon modifiable, enregistré avec la Candidature, copiable ; en-tête ajouté par JobFlow.

## Constraints / Notes
- Décisions du 2026-10-01 : Gemini gratuit (ADR 0008), brouillon enregistré et modifiable, pas d'e-mail ni de téléphone envoyés, consignes facultatives, réglages par défaut (français, 250–350 mots, rien d'inventé).
- Adaptateur `src/lib/ai.ts` (`TextGenerator`, comme `storage.ts`) : appel REST sans SDK, clé en en-tête `x-goog-api-key` (jamais dans l'URL), délai de 60 s, messages clairs pour 429 / 503 / panne / réponse vide.
- Modèle par défaut `gemini-flash-latest` (alias : `gemini-2.5-flash` est refusé aux nouveaux comptes) ; **modèle de secours** `gemini-flash-lite-latest` si le principal répond 503 (surcharge, constatée le 2026-10-01).
- Demande construite en pur (`cover-letter-request.ts`) : Annonce, Profil et consignes dans des balises ; une donnée ne peut pas fermer sa balise ; la consigne système dit que leur contenu n'est jamais une instruction.
- Clé : `GEMINI_API_KEY` dans `.env` (local) ; à ajouter au `.env` de production pour l'utiliser sur la Pi. La clé a été collée dans la conversation : **à régénérer** sur AI Studio, puis à remettre dans les deux `.env`.
- Vérifié de bout en bout le 2026-10-01 (base de dev, profil fictif « Candidat Démo », annonce de démonstration Thales) : 503 sur le modèle principal → message clair ; avec le secours, lettre rédigée en français, fidèle au profil et à l'annonce, en-tête ajouté.

## Missions
- [x] Mission 1: Adaptateur Gemini + configuration + tests avec `fetch` simulé (AC-008-07)
- [x] Mission 2: Demande et en-tête, en pur + tests (AC-008-01, 02, 06)
- [x] Mission 3: Colonne `coverLetterDraft` + migration ; `generateCoverLetter` / `saveCoverLetterDraft` + tests d'intégration avec un faux générateur (AC-008-01, 03 à 05, 07, 08)
- [x] Mission 4: Actions, section « Lettre de motivation » de la fiche + tests de composant (AC-008-01, 05) ; essai réel avec la clé

## Review (2026-10-01)
- Corrigé : une réponse de Gemini illisible ou interrompue (corps au-delà du délai, page HTML) faisait planter la page → message « ne répond pas ».
- Corrigé : la délimitation pouvait être contournée (balise imbriquée `</ann</annonce>once>`, espace, attributs) et l'Entreprise et le poste étaient hors bloc → tout « < » d'une donnée devient « ‹ », et l'Entreprise et le poste sont dans `<annonce>`.
- Corrigé : « Copier » sans presse-papiers (HTTP sur le réseau local, refus) ne disait rien → le texte est sélectionné et un message invite à copier à la main.
