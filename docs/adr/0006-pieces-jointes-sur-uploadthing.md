# Pièces jointes stockées chez UploadThing

Le CV et la lettre de motivation joints à une Candidature (PDF, 4 Mo maximum chacun) sont stockés chez **UploadThing** ; PostgreSQL n'en garde que la référence (clé, URL, nom, taille). L'alternative était le disque de la Raspberry Pi, cohérente avec l'auto-hébergement mais qui laissait le stockage et la sauvegarde des fichiers à notre charge ; l'utilisateur a préféré un service géré, sans exigence de confidentialité sur ces documents. Cette décision **amende l'ADR 0001** : c'est la première donnée joignable hors du tailnet (les fichiers sont servis par une URL UploadThing), accepté parce que ces URL ne se devinent pas et que l'application elle-même reste privée derrière Tailscale.

## Consequences

- Tout accès au stockage passe par `src/lib/storage.ts` (`upload`, `remove`) : UploadThing en production, un faux en mémoire dans les tests, qui n'appellent jamais le service. Changer de stockage (disque de la Pi, S3 compatible) ne touche que cet adaptateur et la migration des fichiers.
- Un envoi réussi suivi d'un enregistrement échoué laisse un fichier à supprimer : le service le supprime, et si la suppression échoue aussi, il le dit à l'utilisateur et le journalise.
- À revoir si la confidentialité ou le multi-utilisateur arrivent : fichiers privés et liens temporaires, ou stockage auto-hébergé.
- `UPLOADTHING_TOKEN` est un secret (`.env`, jamais commité) ; `effect` est forcé en une seule version (`overrides` de `package.json`) pour éviter les avertissements en boucle d'UploadThing.
