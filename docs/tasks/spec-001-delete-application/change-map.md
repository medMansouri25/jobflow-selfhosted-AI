# Change Map: Supprimer une Candidature (T1.8)

## Planned — 2026-09-30, at task creation
_Predicted from missions 1–3. Not edited afterwards; drift is measured against it._

```
applications (service · actions)   [extended]   M1 · M2
                          + deleteApplication · deleteApplicationAction
                          └ will use   lib/storage
                          → deletes an owned Candidature with its history and pièces jointes, then its files at UploadThing, reporting leftovers
        │
applications/components (fiche · bouton Supprimer)   [extended]   M2
                          ▲ will be called by  app/applications/[id]
                          → a confirmed « Supprimer » on the fiche that returns to the list or warns about leftover files
        │
docs (SPEC-001 · TASKS)   [touched]   M3
                          → H3 confirmed; deletion flow documented
```

also touched: none planned

## Actual — 2026-09-30, origin/feature/spec-001-status-change..HEAD
_Derived from the task's commit range (missions 1–3, review fix, doc sync)._

```
applications (service · actions)   [extended]   service.ts · actions.ts
                          + deleteApplication · deleteApplicationAction
                          └ now uses   lib/storage
                          → deletes an owned Candidature (cascade), then its files at UploadThing; redirects to the list or warns about leftovers
        │
applications/components (bouton Supprimer)   [extended]   delete-application-button.tsx
                          + DeleteApplicationButton
                          ▲ called by   app/applications/[id]
                          → a confirmed « Supprimer » whose dialog stays open to show a leftover warning
        │
app/applications/[id]   [touched]   page.tsx
                          → binds the delete action and puts « Supprimer » next to « Modifier »
        │
docs (SPEC-001 · TASKS · architecture)   [touched]
                          → H3 confirmed; deletion order, redirect-after-catch and the non-closing confirmation documented
```

also touched: 2 test files · task docs

## Drift

| Finding | Module | Why |
|---|---|---|
| Unplanned | `app/applications/[id]` | The page binds the action and hands the button to the fiche — folded into « the fiche » by the plan, as in T1.6 and T1.7. |

No predicted module went untouched; no verdict escalated. The review fix (`toStoredFile`) stayed inside `service.ts`.
