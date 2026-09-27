# Task: Machine à états et trois statuts (T1.2)

**Status**: In dev
**Type**: Full-stack
**Created**: 2026-09-27

## Problem
Rien ne dit quelles transitions de statut sont permises, et les six statuts d'origine ne correspondent pas à l'usage réel : l'utilisateur ne veut suivre que Postulée, Entretien et Refusée.

## Outcome
Une Candidature n'a que trois statuts (Postulée → Entretien → Refusée, Postulée → Refusée) et naît toujours Postulée. `src/modules/applications/domain/status.ts` porte la table des transitions et répond, sans dépendance : cette transition est-elle permise, quelles transitions depuis ce statut, ce statut est-il définitif. Base, formulaire, tableau de bord et docs parlent de ces trois statuts.

## Constraints / Notes
- TypeScript pur pour `domain/` (ni Next.js, ni Prisma, ni `lib/errors`) ; les statuts restent importés depuis `domain/application.ts`.
- La table des transitions est écrite une seule fois (`STATUS_TRANSITIONS`) ; `canTransition`, `allowedTransitions` et `isDefinitive` en sont déduits.
- Vocabulaire (CONTEXT.md, 2026-09-27) : **Statut définitif** = Refusée ; plus de « Candidature active / terminée », « Réouverture », Brouillon, Acceptée, Classée ; jamais « terminal ».
- Même statut → refusé. Aucun retour en arrière (Entretien ↛ Postulée, Refusée ↛ tout).
- Hors périmètre : `DomainError` de transition interdite, vérification sur le statut en base, historique, menu de statut (T1.7).
- Tests : la table attendue est réécrite à la main depuis la décision, les 9 paires sont vérifiées ; chaque test cite son critère (`it("refuse INTERVIEW → APPLIED", …)`).
- Données de dev : la candidature de test « Entreprise Test Pi » est supprimée de `jobflow_dev` avant la migration ; Sanofi devient Postulée.
- Branche `feature/spec-001-status-machine`, une PR ; jamais de mention de Claude.

## Extension 1 — 2026-09-27 : trois statuts seulement
Décision prise en grill après avoir vu le tableau de bord : ne garder que **Postulée → Entretien → Refusée** (Postulée → Refusée aussi ; Refusée définitive ; aucun retour en arrière). Brouillon, Acceptée, Classée, « Candidature active / terminée » et « Réouverture » disparaissent (CONTEXT.md mis à jour). Toute Candidature naît Postulée : localisation, contrat, source et date deviennent toujours obligatoires, date pré-remplie au jour ; un seul bouton « Enregistrer ». Migration : DRAFT → APPLIED, ACCEPTED → INTERVIEW, ARCHIVED → APPLIED (candidatures et historique) ; la candidature de test « Entreprise Test Pi » est supprimée de `jobflow_dev` avant la migration. La fenêtre modale se ferme après un enregistrement réussi (bug : une saisie validée par Entrée partait en brouillon et vidait le formulaire). Le tableau de bord perd la carte « Actives » et la carte « Envoyées » (égale au total sans brouillon).
Mission 1 (6 statuts) est remplacée par Mission 2 ; son code est réécrit.

## Missions
- [x] Mission 1: Backend — `domain/status.ts` : `STATUS_TRANSITIONS` (BR-001-05), `canTransition`, `allowedTransitions`, `ACTIVE_STATUSES`, `isActive`, `isDefinitive`, avec tests unitaires des 36 paires et d'AC-001-05 à 09
- [x] Mission 2: Full-stack — création toujours Postulée : schéma sans statut saisi (localisation, contrat, source, date toujours requis), service `createApplication` au statut APPLIED, formulaire à un bouton « Enregistrer » avec date du jour par défaut et marqueurs `*`, fenêtre modale fermée après succès
- [x] Mission 3: Frontend — tableau de bord sans les cartes « Actives » et « Envoyées »
- [ ] Mission 4: Full-stack — trois statuts : enum `ApplicationStatus` réduit à APPLIED / INTERVIEW / REJECTED + migration de conversion (DRAFT → APPLIED, ACCEPTED → INTERVIEW, ARCHIVED → APPLIED), `domain/application.ts` sans `INITIAL_STATUSES`, `domain/status.ts` réécrit (nouvelle table ; plus d'`ACTIVE_STATUSES` / `isActive`) avec tests des 9 paires, libellés, badge et répartition du tableau de bord sur 3 statuts
- [ ] Mission 5: Docs — SPEC-001 (FR/BR/AC touchés par la réduction), ADR 0005 « trois statuts », `frontend-patterns.md` (un seul bouton, statut APPLIED à la création) et `backend-patterns.md` (plus de champs requis selon le statut, nouvel exemple de nom de test)

## Mission Summaries
_Filled in as each mission completes. Future missions read these for context._

### Mission 1: Machine à états des statuts
**Status**: Completed
- **Files**: `src/modules/applications/domain/status.ts`, `status.test.ts`
- **Built**: `STATUS_TRANSITIONS` (table BR-001-05), `canTransition(from, to)`, `allowedTransitions(from)` (ordre de la table, pour le menu), `ACTIVE_STATUSES`, `isActive(status)`, `isDefinitive(status)` (déduit : aucune transition sortante).
- **Tests**: `status.test.ts` (Vitest, projet unit) — AC-001-05 à 09 nommés, les 36 paires contre une table recopiée à la main depuis la spec, active / définitif pour les 6 statuts.
- **Integrates with**: T1.7 appelle `canTransition` sur le statut **en base** et lève sa propre `DomainError` ; son menu affiche `allowedTransitions` et demande confirmation quand la cible `isDefinitive`. T1.9 filtre avec `ACTIVE_STATUSES`.

### Mission 2: Création toujours Postulée
**Status**: Completed
- **Files**: `schemas.ts` (+ test), `service.ts` (+ test d'intégration), `actions.ts`, `components/application-form.tsx` (+ test), `components/new-application-dialog.tsx` (+ test), `src/lib/dates.ts`
- **Built**: le schéma de création n'a plus de `status` ; localisation, contrat, source et date sont toujours requis via un helper `required(schema, label)` (message « … est obligatoire ») ; `createApplication` crée toujours APPLIED avec l'historique `null → APPLIED` ; formulaire à un seul bouton « Enregistrer », date du jour par défaut, marqueurs `*` seulement ; la fenêtre modale enveloppe l'action (`saveAndClose`) et se ferme sur `status: "success"`.
- **Tests**: schemas.test.ts (4 champs requis, candidature complète sans statut), service.integration.test.ts (APPLIED + historique), application-form.test.tsx (un bouton, date du jour Europe/Paris avec horloge figée), new-application-dialog.test.tsx (fermeture après succès, reste ouverte sur erreur).
- **Patterns**: `todayInParis()` vit dans `src/lib/dates.ts`, partagé par l'action serveur et le formulaire client.
- **Integrates with**: Mission 4 peut retirer DRAFT : plus aucun code ne crée de brouillon (`INITIAL_STATUSES` n'est plus importé).

### Mission 3: Tableau de bord sans « Actives » ni « Envoyées »
**Status**: Completed
- **Files**: `src/modules/dashboard/components/dashboard.tsx` (+ test)
- **Built**: deux indicateurs seulement (Candidatures, mis en avant, « Tous statuts confondus » ; Entretiens) sur une grille à 2 colonnes ; l'en-tête affiche « N candidature(s) · 0 entretien à venir ».
- **Tests**: dashboard.test.tsx — totaux lus dans leur carte, aucun texte « activ… » ni « Envoyées ».
- **Integrates with**: Mission 4 réduit la répartition et `EMPTY` du test aux 3 statuts.
