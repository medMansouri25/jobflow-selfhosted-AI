# Change Map: Machine à états des statuts

## Planned — 2026-09-27, at task creation
_Predicted from mission 1. Not edited afterwards; drift is measured against it._

```
applications/domain (status)   [extended]   M1
                          + canTransition · allowedTransitions · isActive · isDefinitive · STATUS_TRANSITIONS · …
                          └ will use   applications/domain (application : ApplicationStatus)
                          → answers, from the single BR-001-05 table, which status changes are allowed and whether a Candidature is active or its status definitive
```

also touched: CONTEXT.md (Candidature terminée, Statut définitif — during the grill)

## Planned (extension 1) — 2026-09-27, missions 2–5
_Predicted from missions 2–5 (three statuses). Not edited afterwards._

```
applications/domain (application · status)   [rewritten]   M4
                          − ACTIVE_STATUSES · isActive · INITIAL_STATUSES
                          → knows only APPLIED, INTERVIEW, REJECTED and the 3-transition table
        │
prisma (schéma, migrations)   [extended]   M4
                          + migration « three statuses »
                          → converts DRAFT/ACCEPTED/ARCHIVED rows and history, then drops them from the enum
        │
applications (schemas · service · actions)   [touched]   M2
                          ▲ will be called by  applications/components (formulaire)
                          → creates every Candidature as APPLIED with location, contract, source and date required
        │
applications/components (formulaire · fenêtre modale · badge · libellés)   [touched]   M2 · M4
                          → one « Enregistrer » button, today's date by default, dialog closes on success, 3 status labels
        │
dashboard   [touched]   M3 · M4
                          → no « Actives » / « Envoyées » cards; status breakdown over 3 statuses
        │
docs (SPEC-001 · ADR 0005 · architecture)   [touched]   M5
                          + ADR 0005
                          → record the three-status decision and the new creation pattern
```

The extension reaches modules the original map never named (prisma, form, dashboard, docs): the task's scope genuinely widened from a pure domain module to a cross-cutting status reduction, agreed with the user as one task.
also touched: jobflow_dev data (test row deleted)

## Actual — 2026-09-27, main..HEAD
_Derived from the task's commit range (missions 1–5, the date fix, doc sync)._

```
applications/domain (application · status)   [extended]   status.ts · application.ts
                          + canTransition · isDefinitive · allowedTransitions · STATUS_TRANSITIONS
                          − INITIAL_STATUSES · InitialStatus
                          → a pure 3-status table (APPLIED → INTERVIEW → REJECTED) from which every status question is derived
        │
prisma (schéma, migrations)   [extended]   schema.prisma · 20260927160000_three_application_statuses
                          → hand-written migration converts old rows and history, then swaps the enum for the 3-value one
        │
applications (schemas · service · actions)   [rewritten]   schemas.ts · service.ts · actions.ts
                          └ now uses   lib/dates
                          → every Candidature is created APPLIED; location, contract, source and date go through a `required` helper instead of a status-dependent rule
        │
applications/components (formulaire · fenêtre modale · badge · libellés)   [rewritten]   application-form.tsx · new-application-dialog.tsx · status-badge.tsx
                          └ now uses   lib/dates
                          → one « Enregistrer » button, today's date read in the browser, dialog closes on success, 3 status labels
        │
lib/dates   [NEW]   dates.ts
                          + todayInParis
                          ▲ called by   applications (actions) · applications/components (formulaire)
                          → the single source of « today » in Europe/Paris, shared by the server action and the prerendered form
        │
dashboard   [rewritten]   dashboard.tsx
                          → two indicators (Candidatures, Entretiens) and a 3-column status breakdown
        │
docs (SPEC-001 · ADR 0005 · architecture · handoff)   [touched]
                          + ADR 0005 · handoff cv-lettre-pieces-jointes
                          → SPEC-001 revised with stable IDs, the three-status decision recorded, enum-migration pattern documented
```

also touched: app/globals.css (status tokens removed) · 12 test files · task tracker, review.md

## Drift

| Finding | Module | Why |
|---|---|---|
| Unplanned | `lib/dates` [NEW] | M2 moved `todayInParis` out of the server action so the form could share it; the M5 fix then made the form read it in the browser (`/applications/new` is prerendered). |
| Escalated | applications (schemas · service · actions) `[touched]` → `[rewritten]` | M2 replaced the status-dependent `superRefine` rule by an always-required `required(schema, label)` helper — the plan under-read how much of the schema the conditional rule occupied. |
| Escalated | applications/components `[touched]` → `[rewritten]` | M2 removed the two-button status choice and the `†` requirement type; M5 added the browser-side date. |
| Escalated | dashboard `[touched]` → `[rewritten]` | M3 + M4 removed more than they added (two KPI cards, derived counts, 6-column grid). |
| Also | handoff `cv-lettre-pieces-jointes` | Not a module: a side request from the user, captured instead of implemented. |

No predicted module went untouched. The escalations are deletions, consistent with a reduction task; nothing to route.
