# Handoff : CV et lettre de motivation en pièces jointes PDF

**Ouvert le** : 2026-09-27, demandé par l'utilisateur pendant la tâche `spec-001-status-machine` (hors de son périmètre).
**Reprendre avec** : `/create-task-from-handoff cv-lettre-pieces-jointes`

## Goal

Remplacer « Version du CV » et « Lettre de motivation » (champs texte `cvLabel` / `coverLetter` du formulaire de Candidature) par des **pièces jointes PDF** : le fichier exact avec lequel j'ai postulé. L'utilisateur propose **UploadThing** comme stockage.

## Context

- Aujourd'hui : deux champs texte libres (`cvLabel` VarChar(200), `coverLetter` Text) dans `prisma/schema.prisma` et le formulaire `src/modules/applications/components/application-form.tsx`. SpecDrivenDevelopment.md §4 prévoyait déjà que le libellé du CV serait « remplacé plus tard par une relation vers un Document ».
- SpecDrivenDevelopment.md §8 (Gestion des documents) et la phase 5 (SPEC-005 `005-document-management.md`, pas encore écrite) couvrent ce besoin : ne pas stocker de gros binaires dans PostgreSQL ; pistes listées : filesystem local, stockage objet S3-compatible, autre.
- **Clé UploadThing** : fournie par l'utilisateur, rangée dans `.env` local (`UPLOADTHING_TOKEN`, non commité). Jamais dans le code, les docs ou une PR. L'utilisateur a été invité à la régénérer (elle est passée en clair dans le chat).

## Open decisions (à trancher en grill)

1. **UploadThing vs stockage auto-hébergé.** Tension avec les décisions existantes : app auto-hébergée sur la Pi, privée via Tailscale (ADR 0001), pas de cloud proposé par défaut. UploadThing envoie les CV (données personnelles) chez un tiers (région `sea1`, États-Unis). Alternative : fichiers sur le disque de la Pi (SSD) servis par l'app. Décision ADR-worthy.
2. **Modèle** : entité `Document` (réutilisable entre Candidatures — un même CV pour plusieurs) ou fichier attaché à une seule Candidature ? Que deviennent `cvLabel` / `coverLetter` et leurs données existantes ?
3. **Contraintes** : PDF seulement ? taille max ? un CV + une lettre, ou plusieurs fichiers ? consultation / téléchargement depuis la fiche (T1.5) ?
4. **Ordre** : avant ou après T1.5 (fiche) / T1.6 (modification) ? La phase 5 prévoyait ce travail après les entretiens et l'agenda.

## Suggested skills

`/create-task-from-handoff cv-lettre-pieces-jointes` → `grill-with-docs` (décisions ci-dessus, ADR stockage) → `tdd` par mission.

## References

- `SpecDrivenDevelopment.md` §4 (champs de la Candidature), §8 (documents)
- `docs/adr/0001-acces-prive-tailscale-sans-authentification.md`
- `specs/001-application-management.md` §7 (modèle de données : `cvLabel`, `coverLetter`)
- Tâche d'origine : `docs/tasks/spec-001-status-machine/progress-tracker.md`
