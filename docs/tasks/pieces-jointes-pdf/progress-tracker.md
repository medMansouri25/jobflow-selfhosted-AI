# Task: Pièces jointes PDF (CV et lettre de motivation)

**Status**: In dev
**Type**: Full-stack
**Created**: 2026-09-28 (depuis le handoff `cv-lettre-pieces-jointes`)

## Problem
« Version du CV » et « Lettre de motivation » sont des champs texte : on ne retrouve pas le fichier exact envoyé à l'Entreprise.

## Outcome
Chaque Candidature peut porter deux **Pièces jointes** PDF — son CV et sa lettre de motivation — envoyées à la création, stockées chez UploadThing ; la base ne garde que leur référence ; la fiche les ouvre dans un nouvel onglet.

## Constraints / Notes
- **Stockage : UploadThing** (choix de l'utilisateur, ADR 0006 à écrire). Fichiers accessibles par leur URL : l'utilisateur n'a pas de contrainte de confidentialité. Jamais de binaire dans PostgreSQL. L'ADR 0006 **amende l'ADR 0001** : première donnée joignable hors du tailnet — accepté (pas d'exigence de confidentialité, URL non devinables, l'application elle-même reste privée), à revoir si la confidentialité ou le multi-utilisateur arrivent.
- Base : entité **Pièce jointe** (`Attachment`), **propriété du module `applications`** — utilisateur (`userId`), Candidature, type (`CV` / `COVER_LETTER`), clé UploadThing, URL, nom d'origine, taille, date ; au plus une par type et par Candidature ; supprimée avec sa Candidature. Les colonnes `cvLabel` et `coverLetter` disparaissent (vides en dev, vérifié le 2026-09-28).
- Chaque Candidature a ses propres pièces jointes, jamais partagées (pas de bibliothèque de documents).
- Deux champs fichier facultatifs, **PDF uniquement, 4 Mo maximum** chacun ; vérifiés avant tout envoi.
- Envoi au moment d'« Enregistrer » : fichiers → UploadThing, puis Candidature + pièces jointes en transaction ; si l'enregistrement échoue, les fichiers envoyés sont supprimés.
- **Messages obligatoires** (formulaire ouvert, saisie conservée) :
  - type / taille : sous le champ, « Le CV doit être un PDF de 4 Mo maximum » (rien n'est envoyé) ;
  - échec d'envoi : « L'envoi du CV a échoué. La candidature n'a pas été enregistrée : réessaie. » ;
  - échec d'enregistrement : « La candidature n'a pas pu être enregistrée. Le fichier envoyé a été supprimé : réessaie. » ;
  - échec de la suppression aussi : « … Le fichier « CV.pdf » est resté sur UploadThing : supprime-le depuis ton tableau de bord UploadThing. » + trace dans les journaux serveur.
- Le stockage passe par **un seul adaptateur**, `src/lib/storage.ts` (envoyer, supprimer) : UploadThing en production, un faux en mémoire dans les tests — aucun test n'appelle UploadThing. C'est une interface vers un service externe, pas une couche d'accès aux données : la règle « pas de repository » reste vraie (à écrire dans `backend-patterns.md`).
- `UPLOADTHING_TOKEN` : dans `.env` (jamais commité), placeholder dans `.env.example`. Limite des Server Actions relevée (~10 Mo) dans `next.config.ts`.
- Dépend de T1.5 (la fiche affiche les pièces jointes). Branche `feature/pieces-jointes-pdf` depuis un `main` à jour ; jamais de mention de Claude.

## Missions
- [x] Mission 1: Backend — dépendance UploadThing, adaptateur de stockage (envoyer / supprimer) avec faux pour les tests, modèle `Attachment` + migration (retrait de `cvLabel` / `coverLetter`), `UPLOADTHING_TOKEN`
- [ ] Mission 2: Backend — création avec pièces jointes : validation PDF ≤ 4 Mo, envoi puis transaction, suppression des fichiers si échec, les quatre messages d'erreur, limite des Server Actions
- [ ] Mission 3: Frontend — formulaire à deux champs fichier (CV, lettre) à la place des champs texte ; section « Pièces jointes » de la fiche avec nom et taille, ouverture dans un nouvel onglet
- [ ] Mission 4: Docs — ADR 0006 (UploadThing, amende ADR 0001), SPEC-001 (modèle, formulaire, « fichiers joints » retirés du hors-périmètre), SPEC-000 (005 réduit à une future bibliothèque de documents partagés), `tech-stack.md`, `backend-patterns.md` (adaptateur de stockage), suppression du handoff

## Mission Summaries
_Filled in as each mission completes. Future missions read these for context._

### Mission 1: Stockage et modèle
**Status**: Completed
- **Files**: `package.json` (uploadthing 7.7.4), `src/lib/storage.ts` (+ test), `src/lib/env.ts` (+ test), `prisma/schema.prisma`, migration `20260927190020_attachments`, `.env.example` ; retrait de `cvLabel` / `coverLetter` dans `schemas.ts`, le formulaire, la fiche et leurs tests
- **Built**: interface `FileStorage` (`upload(file) → { key, url, name, size }`, `remove(keys)`), `StorageError`, `createUploadThingStorage(client)` sur un sous-ensemble typé de `UTApi` (`uploadFiles`, `deleteFiles`), `getStorage()` paresseux ; `UPLOADTHING_TOKEN` facultatif dans `env.ts` ; modèle `Attachment` (userId, applicationId, `AttachmentKind` CV / COVER_LETTER, fileKey unique, url, name, size, createdAt), `@@unique([applicationId, kind])`, cascade depuis Application et User.
- **Tests**: storage.test.ts (faux client UploadThing : correspondance des champs, erreurs d'envoi et de suppression → `StorageError`) ; env.test.ts ; attachments.integration.test.ts (cascade, un seul CV par Candidature).
- **Gotchas**: `UTApi.uploadFiles` renvoie `{ data, error }` (jamais d'exception pour un refus) ; l'URL à garder est `ufsUrl` (`url` est déprécié en v9). Le schéma Zod laissait passer `cvLabel` jusqu'à Prisma : retirer un champ du modèle impose de le retirer aussi du schéma. Le faux stockage en mémoire pour les tests du service arrive avec la Mission 2, son premier utilisateur.
- **Integrates with**: Mission 2 injecte un `FileStorage` dans la création (faux en test, `getStorage()` en production).
