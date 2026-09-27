# Change Map: Modifier une Candidature (T1.6)

## Planned — 2026-09-28, at task creation
_Predicted from missions 1–3. Not edited afterwards; drift is measured against it._

```
applications (schemas · service · actions)   [extended]   M1 · M2
                          + updateApplication · updateApplicationAction
                          └ will use   lib/storage · companies (service)
                          → edits every field but the status, keeps / replaces / adds / removes pièces jointes, deletes old files after saving
        │
applications/components (formulaire · fenêtre · fiche)   [extended]   M2
                          ▲ will be called by  app/applications/[id]
                          → the form pre-fills an existing Candidature and shows its current pièces jointes; the fiche gets a « Modifier » button
        │
docs (SPEC-001 · architecture · TASKS)   [touched]   M3
                          → the edit flow is a dialog on the fiche, not an /edit page
```

also touched: none planned

## Actual — 2026-09-28, main..HEAD
_Derived from the task's commit range (missions 1–3, review fixes, doc sync)._

```
applications (schemas · service · actions)   [extended]   service.ts · schemas.ts · actions.ts
                          + updateApplication · updateApplicationAction · updateApplicationSchema · UpdateApplicationInput
                          └ now uses   lib/storage · applications (form-values)
                          → edits every field but the status inside one owned transaction; attachments kept / replaced / added / removed, old files deleted after saving
        │
applications (form-values · format)   [NEW]   form-values.ts · format.ts
                          + toColumns · toFormValues · formatFileSize
                          ▲ called by   applications (service) · app/applications/[id] · applications/components
                          → the two-way mapping between typed values and columns, with one date convention; file sizes for form and fiche
        │
applications/components (formulaire · fenêtres · fiche)   [extended]   application-form.tsx · application-form-dialog.tsx · edit-application-dialog.tsx · new-application-dialog.tsx · application-detail.tsx
                          + ApplicationFormDialog · EditApplicationDialog
                          → one dialog for create and edit; the form pre-fills and manages current attachments; the fiche exposes an actions slot
        │
app/applications/[id]   [touched]   page.tsx
                          └ now uses   applications (actions · form-values) · applications/components (EditApplicationDialog)
                          → binds the edit action to the id and passes the pre-filled dialog to the fiche
        │
docs (SPEC-001 · TASKS · architecture)   [touched]
                          → the edit flow is a dialog on the fiche; update, mapping and warning patterns documented
```

also touched: form-state.ts (`warning` status) · 6 test files · task docs

## Drift

| Finding | Module | Why |
|---|---|---|
| Unplanned | `applications (form-values · format)` [NEW] | M2 needed `toFormValues` and a shared size formatter; the review (D) then moved `toColumns` there to keep both directions together. |
| Unplanned | `app/applications/[id]` | The page is where the edit action is bound to the id and the dialog is handed to the fiche — the plan folded it into « the fiche ». |
| Escalated | `schemas.ts` `[extended]` → heavy rewrite (+85 / −57) | Sharing fields and rules between create and update meant restructuring the whole schema, not just adding one. |

No predicted module went untouched.
