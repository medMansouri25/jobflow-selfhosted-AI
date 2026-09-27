# Post-Implementation Review: Machine à états et trois statuts (T1.2)
**Reviewed**: 2026-09-27   **Scope**: missions 1–5 / commits main..feb1b27

All three lenses clean — no findings.

## Documentation à trancher ⬜ (sync-architecture, needs-judgment)
- `backend-patterns.md` § ② Schémas : l'exemple « (salaire min ≤ max, date obligatoire en Postulée) » est périmé → proposer « (salaire min ≤ max, date de candidature pas dans le futur) ».
- `backend-patterns.md` § ② Schémas : « l'action calcule `today` dans le fuseau `Europe/Paris` » → préciser « via `todayInParis()` (`@/lib/dates`) ».
- `frontend-patterns.md` : ériger en convention « valeurs propres au navigateur sur une page pré-rendue » (`useSyncExternalStore(subscribeNever, …)`, déjà utilisé par `AppTopbar` et `ApplicationForm`).
