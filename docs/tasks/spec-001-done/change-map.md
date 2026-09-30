# Change Map: Clôture de SPEC-001 (T1.10)

## Actual — 2026-09-30, origin/main..HEAD
_Derived from the task's commit range. No planned map was drawn for this closure task._

```
companies (service)   [extended]   service.ts
                          + listCompanyNames
                          ▲ called by   app (layout) · app/applications/new · app/applications/[id]
                          → lists a user's company names A → Z, cached per request, for the company field suggestions
        │
applications/components (formulaire · fenêtres)   [touched]   application-form.tsx · new-application-dialog.tsx · edit-application-dialog.tsx
                          → the company field suggests existing companies (datalist); a new name stays possible
        │
app (layout · barre du haut)   [touched]   layout.tsx · app-topbar.tsx
                          → the layout is force-dynamic and passes optional company suggestions to the topbar dialog
        │
specs (SPEC-000 · SPEC-001) · TASKS   [touched]
                          → SPEC-001 « Implémentée » with an AC → test table; SPEC-000 « Validée » with the 3-status lifecycle
```

also touched: 5 test files (AC-001-10 cited, AC-001-20 unknown id, suggestions) · docs/architecture/frontend-patterns.md · task docs

## Drift

Drift: no planned map — nothing to compare. Worth noting: a « docs » closure task reached code (companies service, form, layout) because the closure review found FR-001-04 never delivered.
