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

## Actual — 2026-09-28, main..HEAD
_Derived from the task's commit range (missions 1–4, review fixes, doc sync)._

```
lib/storage   [NEW]   storage.ts
                          + createUploadThingStorage · getStorage · StorageError · FileStorage · StoredFile · …
                          ▲ called by   applications (service)
                          → the only code that talks to UploadThing; a typed subset of UTApi, errors as StorageError
        │
applications (schemas · service · actions)   [extended]   service.ts · schemas.ts · actions.ts
                          + MAX_ATTACHMENT_BYTES · MAX_ATTACHMENT_LABEL
                          └ now uses   lib/storage
                          → validates PDFs ≤ 4 Mo, uploads then saves in one transaction, cleans up and explains failures, logs causes
        │
prisma (schéma, migrations)   [extended]   schema.prisma · 20260927190020_attachments
                          + Attachment · AttachmentKind
                          − cvLabel · coverLetter
                          → stores each pièce jointe's reference, never the file
        │
applications/domain · labels   [touched]   application.ts · labels.ts
                          + ATTACHMENT_KINDS · ATTACHMENT_KIND_LABELS
                          → name the two kinds of pièce jointe and their French labels
        │
applications/components (formulaire · fiche)   [touched]   application-form.tsx · application-detail.tsx
                          → two PDF file fields replace the text fields; the fiche links each pièce jointe with its size
        │
lib/env · next.config · package.json   [touched]
                          → optional UPLOADTHING_TOKEN; 10 Mo Server Action bodies; one `effect` version (overrides)
        │
docs (ADR 0006 · ADR 0001 · SPEC-000 · SPEC-001 · architecture)   [touched]
                          + ADR 0006
                          → UploadThing recorded as an amendment to ADR 0001; storage-adapter and file-field patterns
```

also touched: src/test/memory-storage.ts (test fake) · 6 test files · .env.example · migration_lock.toml (rewritten by Prisma) · docs/handoffs (handoff removed)

## Drift

| Finding | Module | Why |
|---|---|---|
| Unplanned | `applications/domain · labels` | M3 needed a domain name for the two kinds (`ATTACHMENT_KINDS`) and their labels, mirroring statuses and contract types. |
| Unplanned | `package.json` `overrides.effect` | Found at the real UploadThing test (M3): two `effect` versions flooded the logs; forced to one. |
| Escalated | applications (schemas · service · actions) `[extended]`, as planned, but `service.ts` grew most (+81) | The four failure paths and the cleanup helper (`discardUploads`) weighed more than the happy path. |

No predicted module went untouched.
