# Task: Supprimer une Candidature (T1.8)

**Status**: In dev
**Type**: Full-stack
**Created**: 2026-09-30

## Problem
Une Candidature saisie par erreur ne peut pas être supprimée.

## Outcome
Un bouton « Supprimer » sur la fiche, après confirmation, supprime définitivement la Candidature, son historique et ses pièces jointes (en base et chez UploadThing), puis ramène à la liste ; l'Entreprise reste (FR-001-07, BR-001-12, BR-001-13, AC-001-12, AC-001-13).

## Constraints / Notes
- Bouton « Supprimer » (contour rouge) à côté de « Modifier » ; confirmation `AlertDialog` : « Supprimer cette candidature ? « <poste> » chez <Entreprise>. Son historique des statuts et ses pièces jointes seront supprimés. Cette action est irréversible. » [Annuler] [Supprimer]. Annuler ne supprime rien (AC-001-13). Pas de phrase sur « Classer » (statut retiré, ADR 0005). Suppression depuis la fiche seulement.
- Ordre : suppression **en base d'abord** (cascade : historique, pièces jointes — BR-001-13), **puis** des fichiers chez UploadThing. Si la base échoue, rien n'est perdu.
- Échec de la suppression des fichiers : la Candidature reste supprimée ; la fenêtre reste ouverte avec un avertissement nommant le fichier resté sur UploadThing (+ bouton « Retour à la liste »), et c'est journalisé — même mécanique que T1.6 (`discardUploads` → `leftover`, état `warning`).
- Sans problème : retour direct à `/applications`.
- Accès via `findOwnedApplication` (introuvable pour un autre utilisateur ou un id mal formé).
- L'Entreprise reste en base (BR-001-12) : **H3 confirmée** le 2026-09-30.
- Branche `feature/spec-001-delete-application`, **empilée sur la branche de T1.7** (PR #12 pas encore fusionnée) ; une PR, revue complète avant fusion ; jamais de mention de Claude.

## Missions
- [x] Mission 1: Backend — `deleteApplication(userId, id, storage)` : propriétaire vérifié, suppression en cascade, puis fichiers chez UploadThing, `leftover` si leur suppression échoue ; Entreprise conservée (AC-001-12) — tests d'intégration
- [ ] Mission 2: Frontend — action `deleteApplicationAction` liée à l'id, bouton « Supprimer » + confirmation sur la fiche, retour à la liste ou avertissement (AC-001-13)
- [ ] Mission 3: Docs — SPEC-001 (H3 confirmée, §8 suppression), `TASKS.md` (T1.8), patterns si besoin

## Mission Summaries
_Filled in as each mission completes. Future missions read these for context._

### Mission 1: Service de suppression
**Status**: Completed
- **Files**: `service.ts`, `delete.integration.test.ts`
- **Built**: `deleteApplication(userId, id, storage = getStorage())` → `{ leftover }` : `findOwnedApplication(tx, …, { attachments: true })` puis `tx.application.delete` (cascade : historique, pièces jointes), puis `discardUploads` sur les fichiers de la Candidature supprimée ; l'Entreprise n'est pas touchée.
- **Tests**: 4 d'intégration (AC-001-12 avec 3 entrées d'historique et Entreprise conservée, fichiers supprimés au stockage, échec de suppression des fichiers → `leftover` + journal, propriétaire / id mal formé sans rien supprimer) ; mutation vérifiée (fichiers jamais supprimés → 2 tests échouent).
- **Integrates with**: Mission 2 : `deleteApplicationAction(id)` → `redirect("/applications")` sans `leftover`, sinon état `warning`.
