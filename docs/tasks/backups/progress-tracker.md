# Task: Sauvegardes (T1.5.7)

**Status**: Completed
**Type**: Infra
**Created**: 2026-10-01
**Roadmap**: phase-1-5-squelette-deploye (tâche `backups`)

## Problem
La base de production vit sur la carte SD de la Pi (ADR 0007) : sans sauvegarde copiée ailleurs, une panne de carte efface tout.

## Outcome
Chaque nuit à 3 h 30, la Pi sauvegarde la base (7 gardées) ; le PC récupère celles qui lui manquent quand il est allumé ; la restauration est écrite et testée.

## Constraints / Notes
- Décisions : sauvegarde récupérée par le PC (pas de stockage en ligne), production vide au départ (ADR 0007).
- Sauvegardes et dossier en `600` / `700` : elles contiennent toutes les données. Fichier `.partial` puis renommage : une sauvegarde interrompue n'est jamais prise pour bonne (Pi comme PC).
- Les scripts sont versionnés dans `deploy/` et **copiés** hors du dépôt (`~/jobflow-prod/`, `%USERPROFILE%\JobFlow\`) : la tâche planifiée ne dépend pas de la branche ouverte dans le dépôt.
- `pull-backups.ps1` est en UTF-8 avec BOM et écrit son journal en UTF-8 (Windows PowerShell 5.1 lit sinon les accents en ANSI).
- La base de dev ne contient plus de Candidature (constaté le 2026-10-01) : l'essai de restauration utilise une Candidature de test créée dans une base jetable.

## Missions
- [x] Mission 1: Pi — `deploy/backup.sh` + crontab 3 h 30 ; rotation vérifiée (10 fichiers → 7)
- [x] Mission 2: PC — `deploy/pull-backups.ps1` + tâche planifiée (ouverture de session, 9 h, rattrapage) ; 2 copiées puis 0
- [x] Mission 3: Restauration — essai sur base jetable avec données de test (comptes identiques) et procédure jouée sur la production ; `docs/runbooks/backups.md`

## Review (2026-10-01)
- Corrigé : `mkdir -p -m 700 ~/jobflow-backups` dans la procédure d'installation (sans le dossier, la redirection du journal de cron échoue et la sauvegarde ne tourne jamais, sans alerte).
- Corrigé : `pull-backups.ps1` ne confond plus « aucune sauvegarde sur la Pi » avec « Pi injoignable ».
- Ouvert : chaque `./deploy.sh` fait une sauvegarde qui compte dans les 7 gardées ; plusieurs déploiements le même jour peuvent faire sortir des sauvegardes nocturnes.
