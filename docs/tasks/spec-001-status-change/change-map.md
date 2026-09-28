# Change Map: Changer le statut (T1.7)

## Planned — 2026-09-28, at task creation
_Predicted from missions 1–3. Not edited afterwards; drift is measured against it._

```
applications (schemas · service · actions)   [extended]   M1 · M2
                          + changeApplicationStatus · changeStatusSchema · changeStatusAction
                          └ will use   applications/domain (status)
                          → changes a Candidature's status only along the allowed transitions, re-checked on the stored status, with its history line
        │
lib/errors   [touched]   M1
                          + InvalidTransitionError
                          → names the refusal of a status transition
        │
applications/components (fiche · bloc Statut)   [extended]   M2
                          ▲ will be called by  app/applications/[id]
                          → shows one button per allowed transition, confirms a definitive status, says « Statut définitif » otherwise
        │
docs (SPEC-001 · TASKS)   [touched]   M3
                          → H2 settled; the status block is buttons, not a menu
```

also touched: none planned

## Actual — 2026-09-28, main..HEAD
_Derived from the task's commit range (missions 1–3, review fixes, doc sync)._

```
applications (schemas · service · actions)   [extended]   service.ts · actions.ts · schemas.ts
                          + changeApplicationStatus · changeStatusAction · changeStatusSchema
                          └ now uses   applications/domain (status) · lib/errors
                          → changes a status only along allowed transitions re-checked on the stored status; every by-id access goes through findOwnedApplication
        │
applications/components (bloc Statut · fiche · formulaire)   [extended]   status-panel.tsx · section.tsx · form-state-message.tsx · application-detail.tsx · application-form.tsx
                          + StatusPanel · Section · FormStateMessage
                          ▲ called by   app/applications/[id]
                          → one button per allowed transition with confirmation before a definitive status; card and message components shared by fiche, form and panel
        │
components/ui (AlertDialog)   [NEW]   alert-dialog.tsx
                          + AlertDialog · AlertDialogAction · AlertDialogCancel · AlertDialogContent · …
                          → shadcn wrapper of the Radix AlertDialog already installed
        │
applications/domain (status) · labels   [touched]   status.ts · labels.ts
                          + TransitionTarget · TRANSITION_LABELS
                          → names the statuses a transition can reach and their button labels
        │
lib/errors   [touched]   errors.ts
                          + InvalidTransitionError
                          → names the refusal of a status transition
        │
app/applications/[id]   [touched]   page.tsx
                          → binds the status action to the id and passes the status block to the fiche
        │
docs (SPEC-001 · TASKS · architecture)   [touched]
                          → H2 settled; status block is buttons; findOwnedApplication, shared components and AlertDialog documented
```

also touched: 4 test files · task docs

## Drift

| Finding | Module | Why |
|---|---|---|
| Unplanned | `components/ui (AlertDialog)` [NEW] | M2: the confirmation needed an alert dialog; the Radix primitive was installed but had no shadcn wrapper yet. |
| Unplanned | `applications/domain (status) · labels` | M2 labels, then the review (A) narrowed the transition targets so the impossible « Repasser en Postulée » label could go. |
| Unplanned | `app/applications/[id]` | The page binds the action and passes the block — folded into « the fiche » by the plan, as in T1.6. |
| Escalated | `applications/components` `[extended]`, wider than planned | The review (B, D) pulled `Section` and `FormStateMessage` out of the fiche and the form to share them with the status block. |

No predicted module went untouched.
