# Change Map: Pièces jointes PDF

## Planned — 2026-09-28, at task creation
_Predicted from missions 1–4. Not edited afterwards; drift is measured against it._

```
lib/storage   [NEW]   M1
                          ▲ will be called by  applications (service)
                          → the one seam to UploadThing (upload, delete), with an in-memory fake for tests
        │
prisma (schéma, migrations)   [extended]   M1
                          + Attachment
                          − cvLabel · coverLetter
                          → stores each pièce jointe's UploadThing key, URL, name, size and date, never the file
        │
applications (schemas · service · actions)   [extended]   M2
                          └ will use   lib/storage
                          → validates PDFs ≤ 4 MB, uploads then saves in one transaction, deletes uploads on failure with explicit messages
        │
applications/components (formulaire · fiche)   [touched]   M3
                          → two PDF file fields instead of text; the fiche links each pièce jointe with its name and size
        │
lib/env · next.config   [touched]   M1 · M2
                          → knows UPLOADTHING_TOKEN; Server Actions accept ~10 MB bodies
        │
docs (ADR 0006 · SPEC-000 · SPEC-001 · architecture)   [touched]   M4
                          + ADR 0006
                          → record UploadThing as an amendment to ADR 0001 and the storage-adapter pattern
```

also touched: package.json / lockfile (uploadthing), .env.example, docs/handoffs (handoff removed)
