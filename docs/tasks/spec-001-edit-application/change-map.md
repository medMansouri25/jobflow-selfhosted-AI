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
