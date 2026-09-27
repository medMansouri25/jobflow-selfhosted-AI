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
