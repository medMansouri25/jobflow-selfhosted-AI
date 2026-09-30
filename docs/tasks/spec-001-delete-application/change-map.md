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
