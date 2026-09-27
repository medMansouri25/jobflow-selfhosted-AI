# Task: Modifier une Candidature (T1.6)

**Status**: In dev
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
- [ ] Mission 1: Backend — schéma de modification (+ « Retirer » CV / lettre) et `updateApplication` : propriétaire vérifié (404 sinon), champs mis à jour, Entreprise trouvée ou créée, pièces jointes gardées / remplacées / ajoutées / retirées, anciens fichiers supprimés après l'enregistrement, tous les cas d'échec (tests d'intégration avec faux stockage)
- [ ] Mission 2: Frontend — action `updateApplicationAction`, formulaire pré-rempli avec le bloc « pièces jointes actuelles », bouton « Modifier » et fenêtre « Modifier — <Entreprise> » sur la fiche, fermeture et rechargement après succès (AC-001-11)
- [ ] Mission 3: Docs — SPEC-001 (§8 : modification en fenêtre, plus de page `/edit` ; pièces jointes modifiables), `frontend-patterns.md`, `backend-patterns.md` si un pattern change, `TASKS.md`

## Mission Summaries
_Filled in as each mission completes. Future missions read these for context._
