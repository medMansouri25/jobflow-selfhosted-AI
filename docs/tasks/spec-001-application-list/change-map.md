# Change Map: Liste, recherche, filtres, tri (T1.9)

## Planned — 2026-09-30, at task creation
_Predicted from missions 1–3. Not edited afterwards; drift is measured against it._

```
applications (schemas · service)   [extended]   M1
                          + listApplicationsSchema · listApplications · listRecentApplications
                          ▲ will be called by  app/applications · app (tableau de bord)
                          → searches, filters, sorts and paginates a user's Candidatures from URL parameters
        │
app/applications (liste)   [extended]   M2
                          └ will use   applications (schemas · service) · applications/components (liste)
                          → reads the URL, shows the filter bar, the page of results and the pager
        │
applications/components (liste · filtres · pagination)   [extended]   M2
                          → a GET filter bar, a filtered empty state and a pager that keeps the filters
        │
app (tableau de bord)   [touched]   M1
                          → takes its 5 recent Candidatures from listRecentApplications
        │
docs (SPEC-001 · TASKS)   [touched]   M3
                          → H5 confirmed; list behaviour documented
```

also touched: none planned

## Actual — 2026-09-30, main..HEAD
_Derived from the task's commit range (missions 1–3, review fixes, doc sync)._

```
applications (schemas · service)   [extended]   schemas.ts · service.ts
                          + listApplicationsSchema · listApplications · listRecentApplications · hasActiveFilters · LIST_SORTS · ListApplicationsInput
                          ▲ called by   app/applications · app (tableau de bord)
                          → reads tolerant URL filters; searches (wildcards escaped), filters, sorts and paginates by 25 with a clamped page
        │
applications (list-href)   [NEW]   list-href.ts
                          + listHref
                          ▲ called by   applications/components (pagination)
                          → writes the list URL back from the filters, omitting defaults
        │
applications/components (filtres · pagination · liste)   [extended]   application-filters.tsx · pagination.tsx · applications-table.tsx
                          + ApplicationFilters · Pagination
                          → a GET filter bar, a pager that keeps the filters, and a filtered empty state
        │
app/applications (liste)   [touched]   page.tsx
                          → reads searchParams and assembles filters, results and pager
        │
app (tableau de bord)   [touched]   page.tsx
                          → takes its 5 recent Candidatures from listRecentApplications
        │
docs (SPEC-001 · TASKS · architecture)   [touched]
                          → H5 confirmed; tolerant URL schema, LIKE escaping, pagination and filter bar documented
```

also touched: labels.ts (`LIST_SORT_LABELS`) · 6 test files · task docs

## Drift

| Finding | Module | Why |
|---|---|---|
| Unplanned | `applications (list-href)` [NEW] | M2 needed the inverse of the schema for pagination links; kept as its own small module. |

No predicted module went untouched; no verdict escalated.
