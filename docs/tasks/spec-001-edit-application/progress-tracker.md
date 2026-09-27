# Task: Modifier une Candidature (T1.6)

**Status**: Completed
**Type**: Full-stack
**Created**: 2026-09-28

## Problem
Une Candidature enregistrée ne peut plus être corrigée : ni une faute de saisie, ni une note ajoutée après coup, ni un CV ou une lettre à remplacer.

## Outcome
Un bouton « Modifier » sur la fiche ouvre le formulaire pré-rempli (« Modifier — <Entreprise> ») ; tous les champs sauf le statut se modifient, les pièces jointes se gardent, se remplacent, s'ajoutent ou se retirent ; la fiche affiche aussitôt les nouvelles valeurs (FR-001-02, BR-001-10, AC-001-11).

## Constraints / Notes
- **Fenêtre modale** ouverte depuis la fiche, comme la création et la maquette ; **pas de page `/applications/[id]/edit`** (SPEC-001 §8 à corriger).
- Mêmes règles que la création (champs `*`, date non future, salaire, URL http(s), PDF ≤ 4 Mo). La date de candidature est pré-remplie avec la date **enregistrée**. Le statut n'apparaît pas dans le formulaire ; une Candidature Refusée reste modifiable.
- Pièces jointes, pour le CV comme pour la lettre : fichier actuel affiché (nom, taille) + case « Retirer » + champ « Remplacer par… » ; sans fichier actuel, un simple champ pour ajouter. Rien coché, rien choisi → on garde.
- Ordre : envoyer les nouveaux fichiers → enregistrer (transaction) → **ensuite seulement** supprimer les anciens chez UploadThing. Échec d'envoi ou d'enregistrement : nouveaux fichiers supprimés, messages et journalisation comme à la création. Échec de la suppression d'un ancien fichier : la modification **reste enregistrée**, le message de succès nomme le fichier à supprimer à la main, et c'est journalisé.
- Entreprise renommée → rattachement à l'Entreprise trouvée (sans casse) ou créée ; l'ancienne reste en base (BR-001-12, H3).
- L'historique des statuts ne change pas ; `updatedAt` change (la Candidature remonte dans les listes).
- Après succès : fenêtre fermée, fiche rechargée (`revalidatePath`). Après erreur : fenêtre ouverte, saisie texte conservée.
- Réutiliser la mécanique d'envoi / nettoyage de `createApplication` (`discardUploads`) plutôt que la dupliquer ; l'adaptateur `lib/storage.ts` reste le seul accès à UploadThing.
- Branche `feature/spec-001-edit-application`, une PR, revue complète avant fusion ; jamais de mention de Claude.

## Missions
- [x] Mission 1: Backend — schéma de modification (+ « Retirer » CV / lettre) et `updateApplication` : propriétaire vérifié (404 sinon), champs mis à jour, Entreprise trouvée ou créée, pièces jointes gardées / remplacées / ajoutées / retirées, anciens fichiers supprimés après l'enregistrement, tous les cas d'échec (tests d'intégration avec faux stockage)
- [x] Mission 2: Frontend — action `updateApplicationAction`, formulaire pré-rempli avec le bloc « pièces jointes actuelles », bouton « Modifier » et fenêtre « Modifier — <Entreprise> » sur la fiche, fermeture et rechargement après succès (AC-001-11)
- [x] Mission 3: Docs — SPEC-001 (§8 : modification en fenêtre, plus de page `/edit` ; pièces jointes modifiables), `frontend-patterns.md`, `backend-patterns.md` si un pattern change, `TASKS.md`

## Mission Summaries
_Filled in as each mission completes. Future missions read these for context._

### Mission 1: Schéma et service de modification
**Status**: Completed
- **Files**: `schemas.ts` (+ test), `service.ts`, `update.integration.test.ts`
- **Built**: `schemas.ts` découpé en `applicationFields` + `crossFieldRules(today)`, partagés par `createApplicationSchema` et le nouveau `updateApplicationSchema` (+ cases `removeCv` / `removeCoverLetter`, « on » → vrai). `service.ts` : `toColumns(input)` écrit chaque colonne (champ vidé → `null`), `isUuid`, `uploadAttachments` et `saveOrDiscard` extraits de la création ; `updateApplication(userId, id, input, storage)` → `{ application, leftover }` : propriétaire vérifié dans la transaction (404 sinon), pièces jointes gardées / remplacées / ajoutées / retirées, anciens fichiers supprimés après l'enregistrement.
- **Tests**: 10 tests d'intégration (AC-001-11, champ vidé, propriétaire, Entreprise corrigée, ajout, remplacement, retrait, échec d'envoi, introuvable avec fichier envoyé, ancien fichier non supprimé) + 1 unitaire (cases « Retirer ») ; mutation vérifiée (ignorer « Retirer » fait échouer un test).
- **Gotchas**: Prisma **ignore** une valeur `undefined` au lieu de vider la colonne : sans `toColumns`, vider des notes n'aurait rien effacé (trouvé par le test « champ vidé »). Sans contrôle de propriétaire, `update({ where: { id } })` aurait laissé un autre utilisateur modifier la Candidature (test rouge avant le correctif). Une `DomainError` levée dans la transaction (ex. introuvable) garde son message après le nettoyage des fichiers (`saveOrDiscard`).
- **Integrates with**: Mission 2 appelle `updateApplication` depuis `updateApplicationAction` et affiche `leftover` dans le message de succès.

### Mission 2: Interface de modification
**Status**: Completed
- **Files**: `actions.ts`, `form-values.ts` (+ test), `form-state.ts`, `format.ts`, `components/application-form.tsx` (+ test), `application-form-dialog.tsx`, `new-application-dialog.tsx`, `edit-application-dialog.tsx` (+ test), `application-detail.tsx` (+ test), `app/applications/[id]/page.tsx`
- **Built**: `updateApplicationAction(id, …)` (lié par la page avec `bind`), `readForm` / `invalid` partagés avec la création ; nouvel état `warning` (enregistré mais un ancien fichier reste chez UploadThing → la fenêtre reste ouverte et l'affiche) ; `toFormValues(application)` ; `ApplicationForm` accepte `label`, `initialValues`, `attachments` et affiche `AttachmentField` (fichier actuel + « Retirer … » + « Remplacer … par… ») ; `ApplicationFormDialog` générique (fermeture sur `success`), utilisé par `NewApplicationDialog` et `EditApplicationDialog` (« Modifier — <Entreprise> ») ; `ApplicationDetail` reçoit un emplacement `actions` ; `formatFileSize` partagé (`format.ts`).
- **Tests**: form-values.test.ts ; formulaire (pré-remplissage, pièces jointes actuelles) ; fenêtre de modification (ouverture, fermeture après succès, reste ouverte sur `warning`) ; fiche (emplacement des actions). Essai réel : Candidature d'essai modifiée depuis sa fiche (poste changé, CV ajouté chez UploadThing) → fiche mise à jour ; tout nettoyé ensuite (UploadThing vide, base : Sanofi seule).
- **Gotchas**: dans le panneau navigateur caché, la fenêtre Radix fermée reste dans le DOM (`data-state="closed"`, animation de sortie jamais jouée car `visibilityState: hidden`) : vérifier `data-state`, pas la présence de `[role=dialog]`. Ce n'est pas un bug de l'application.

### Mission 3: Documentation
**Status**: Completed
- **Files**: `specs/001-application-management.md` (§8 : fenêtre de modification au lieu de la page `/edit`), `TASKS.md` (T1.6 cochée et réécrite), `docs/architecture/frontend-patterns.md` (fenêtre générique, état `warning`, pré-remplissage, pièces jointes actuelles, emplacement `actions`)
