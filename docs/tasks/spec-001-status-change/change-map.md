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
