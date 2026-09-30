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
