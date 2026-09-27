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

## Actual — 2026-09-28, main..HEAD
_Derived from the task's commit range (missions 1–3, review cleanup, doc sync)._

```
applications/components (fiche · badge)   [extended]   application-detail.tsx · status-badge.tsx
                          + ApplicationDetail · STATUS_DOT_CLASSES · ApplicationDetailData
                          ▲ called by   app/applications/[id] · dashboard
                          → renders one Candidature read-only; status colors now shared from the badge module
        │
app/applications/[id]   [NEW]   page.tsx
                          └ now uses   applications (service) · applications/components (fiche)
                          → loads the Candidature and turns NotFoundError into a 404
        │
components (RowLink)   [NEW]   row-link.tsx
                          + RowLink
                          ▲ called by   applications/components (liste) · dashboard
                          → makes a whole table row a real link from its first cell
        │
applications (service)   [touched]   service.ts
                          → getApplication rejects a non-UUID id as NotFoundError before querying
        │
applications/components (liste)   [touched]   applications-table.tsx
                          └ now uses   components (RowLink)
                          → each row opens its fiche; empty state no longer mentions an « Annonce repérée »
        │
dashboard   [touched]   dashboard.tsx
                          └ now uses   components (RowLink) · applications/components (STATUS_DOT_CLASSES)
                          → each recent Candidature opens its fiche
```

also touched: docs/architecture (frontend, backend patterns) · 4 test files · task docs

## Drift

| Finding | Module | Why |
|---|---|---|
| Unplanned | `components (RowLink)` [NEW] | M3 refactor: the full-row link was written twice (list, dashboard) and pulled into one shared component. |
| Unplanned | `status-badge` (`STATUS_DOT_CLASSES`) | M2 needed the status dot colors for the history; moved from the dashboard to be shared instead of copied. |

No predicted module went untouched; no verdict escalated. The two unplanned rows are extractions that removed duplication.
