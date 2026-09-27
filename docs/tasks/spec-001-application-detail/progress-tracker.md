# Task: Consulter une Candidature (T1.5)

**Status**: Completed
**Type**: Full-stack
**Created**: 2026-09-28

## Problem
Une Candidature enregistrée ne s'ouvre nulle part : les lignes de la liste et du tableau de bord ne mènent à rien, on ne peut ni relire l'Annonce ni voir l'historique des statuts.

## Outcome
`/applications/[id]` affiche la fiche d'une Candidature (en-tête, Annonce, notes, historique des statuts, pièces jointes) ; toute ligne de la liste et des « Candidatures récentes » y mène ; un identifiant inconnu ou mal formé donne une page 404.

## Constraints / Notes
- Maquette `JobFlow AI.html` (vue `v.detail`) comme référence visuelle, sans ce qui n'existe pas encore : **pas** de boutons Modifier / Supprimer (T1.6 / T1.8), **pas** de bloc de transitions (T1.7), **pas** de section Entretiens (phase 3). Le statut s'affiche en badge à côté du titre.
- En-tête : poste en titre + badge ; ligne « Entreprise · Localisation · Contrat · Postulée le <date> » ; lien « ← Candidatures ».
- **Annonce** : source, salaire (« 42 000 – 48 000 € / an »), lien d'Annonce (`target="_blank" rel="noopener noreferrer"`), description en texte brut avec retours à la ligne (AC-001-19). **Notes personnelles** en texte brut. **Pièces jointes** (terme de CONTEXT.md, dès maintenant) : textes actuels (`cvLabel`, `coverLetter`), remplacés par les PDF dans la tâche `pieces-jointes-pdf`.
- **Historique des statuts**, le plus récent en haut : titre = nouveau statut ; explication « Candidature créée » (première entrée) ou « depuis <ancien statut> » ; date « 27 sept. 2026 · 16:05 » en Europe/Paris ; point à la couleur du statut.
- Champ facultatif vide → « — » ; section entièrement vide → non affichée.
- 404 (`notFound()`) pour un id inconnu **ou** qui n'est pas un UUID (sinon PostgreSQL lève une erreur de type) — AC-001-20.
- Lignes cliquables : le nom de l'Entreprise est un vrai lien dont la zone s'étend à toute la ligne (clavier, clic molette), survol visible — dans la liste `/applications` et les « Candidatures récentes » du tableau de bord.
- Au passage : le texte de l'état vide de la liste parle encore d'« Annonce repérée » (plus de Brouillon, ADR 0005) → à corriger.
- Branche `feature/spec-001-application-detail`, une PR ; jamais de mention de Claude.

## Missions
- [x] Mission 1: Backend — `getApplication` renvoie `NotFoundError` pour un id qui n'est pas un UUID comme pour un id inconnu (test d'intégration)
- [x] Mission 2: Frontend — page `/applications/[id]` et composant de fiche (en-tête, Annonce, notes, historique des statuts, pièces jointes), 404 via `notFound()` (AC-001-19, AC-001-20)
- [x] Mission 3: Frontend — lignes cliquables vers la fiche dans la liste et les « Candidatures récentes », texte de l'état vide corrigé

## Mission Summaries
_Filled in as each mission completes. Future missions read these for context._

### Mission 1: id mal formé = introuvable
**Status**: Completed
- **Files**: `src/modules/applications/service.ts`, `service.integration.test.ts`
- **Built**: `getApplication` vérifie `z.uuid()` avant la requête et lève `NotFoundError("Candidature introuvable.")`, comme pour un id inconnu ou appartenant à un autre utilisateur.
- **Integrates with**: la page de la Mission 2 n'a qu'une erreur à traduire en `notFound()`.

### Mission 2: Fiche d'une Candidature
**Status**: Completed
- **Files**: `src/app/applications/[id]/page.tsx`, `components/application-detail.tsx` (+ test), `components/status-badge.tsx`, `dashboard/components/dashboard.tsx`
- **Built**: `ApplicationDetail` (composant serveur, type `ApplicationDetailData` = retour de `getApplication`) : en-tête (poste, badge, « Entreprise · Lieu · Contrat · Postulée le … »), Annonce (source, salaire formaté, lien `_blank` + `noopener noreferrer`, description en `whitespace-pre-wrap`), Notes et Pièces jointes affichées seulement si remplies, historique (Europe/Paris, « Candidature créée » / « depuis … », point coloré). La page traduit `NotFoundError` en `notFound()` via `.catch` (pas de JSX dans un try/catch : règle ESLint React).
- **Tests**: application-detail.test.tsx — 7 tests (en-tête, AC-001-19, champs d'Annonce, « — », historique, sections conditionnelles). 404 vérifiée par HTTP : `abc` et un UUID inconnu → 404, Sanofi → 200.
- **Patterns**: `STATUS_DOT_CLASSES` exporté par `status-badge.tsx`, partagé par le tableau de bord et l'historique.
- **Integrates with**: la tâche `pieces-jointes-pdf` remplace le contenu de la section « Pièces jointes » (`TODO(pieces-jointes-pdf)`).

### Mission 3: Lignes cliquables
**Status**: Completed
- **Files**: `src/components/row-link.tsx`, `components/applications-table.tsx` (+ test), `dashboard/components/dashboard.tsx` (+ test)
- **Built**: `RowLink` — lien dans la première cellule dont `after:absolute after:inset-0` couvre toute la ligne (la ligne est `relative`, survol `bg-muted/60`, anneau de focus clavier) ; utilisé par la liste et les « Candidatures récentes ». État vide de la liste : « … pour enregistrer une candidature envoyée ».
- **Tests**: href du lien Entreprise dans les deux tableaux. Vérifié dans le navigateur : le centre de la cellule « Le Mans » renvoie le lien (`elementFromPoint`), un clic ouvre la fiche.
