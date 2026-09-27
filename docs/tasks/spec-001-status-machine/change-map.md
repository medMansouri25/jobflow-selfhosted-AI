# Change Map: Machine à états des statuts

## Planned — 2026-09-27, at task creation
_Predicted from mission 1. Not edited afterwards; drift is measured against it._

```
applications/domain (status)   [extended]   M1
                          + canTransition · allowedTransitions · isActive · isDefinitive · STATUS_TRANSITIONS · …
                          └ will use   applications/domain (application : ApplicationStatus)
                          → answers, from the single BR-001-05 table, which status changes are allowed and whether a Candidature is active or its status definitive
```

also touched: CONTEXT.md (Candidature terminée, Statut définitif — during the grill)
