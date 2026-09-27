# Change Map: Consulter une Candidature (T1.5)

## Planned — 2026-09-28, at task creation
_Predicted from missions 1–3. Not edited afterwards; drift is measured against it._

```
applications/components (fiche)   [extended]   M2
                          ▲ will be called by  app/applications/[id]
                          → renders one Candidature: header, Annonce in plain text, notes, status history, pièces jointes
        │
app/applications/[id]   [NEW]   M2
                          └ will use   applications (service) · applications/components (fiche)
                          → the Candidature page, 404 for an unknown or malformed id
        │
applications (service)   [touched]   M1
                          → getApplication answers NotFoundError for a non-UUID id too
        │
applications/components (liste)   [touched]   M3
                          → each row links to its fiche; empty state no longer mentions an « Annonce repérée »
        │
dashboard   [touched]   M3
                          → each recent Candidature links to its fiche
```

also touched: none planned
