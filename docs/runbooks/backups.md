# Sauvegardes et restauration

Sauvegarde de la base de production (SPEC-010, ADR 0007). Les PDF ne sont pas concernés : ils sont chez UploadThing (ADR 0006), la base n'en garde que les références.

## Comment ça marche

| Où | Quoi | Quand |
|---|---|---|
| Pi | [`deploy/backup.sh`](../../deploy/backup.sh) (copié en `~/jobflow-prod/backup.sh`) : `pg_dump --format=custom` dans `~/jobflow-backups/`, garde les **7** plus récentes, fichiers lisibles par `mohammed` seul | chaque nuit à **3 h 30** (crontab de `mohammed`) ; journal : `~/jobflow-backups/backup.log` |
| PC | [`deploy/pull-backups.ps1`](../../deploy/pull-backups.ps1) (copié en `%USERPROFILE%\JobFlow\pull-backups.ps1`) : copie par Tailscale les sauvegardes qu'il n'a pas encore dans `%USERPROFILE%\JobFlow\sauvegardes\` | tâche planifiée « JobFlow - recuperer les sauvegardes » : à l'ouverture de session et chaque jour à 9 h, rattrapée au démarrage si le PC était éteint ; journal : `recuperation.log` |

Le PC garde toutes les sauvegardes récupérées : supprimer à la main les plus anciennes de temps en temps.

## Installer

Sur la Pi :

```bash
chmod 700 ~/jobflow-prod/backup.sh
(crontab -l 2>/dev/null; echo '30 3 * * * $HOME/jobflow-prod/backup.sh >> $HOME/jobflow-backups/backup.log 2>&1') | crontab -
```

Sur le PC (PowerShell, sans droits administrateur) :

```powershell
Copy-Item deploy\pull-backups.ps1 "$env:USERPROFILE\JobFlow\pull-backups.ps1"
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$env:USERPROFILE\JobFlow\pull-backups.ps1`""
$triggers = @((New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME), (New-ScheduledTaskTrigger -Daily -At '09:00'))
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RunOnlyIfNetworkAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 15)
Register-ScheduledTask -TaskName 'JobFlow - recuperer les sauvegardes' -Action $action -Trigger $triggers -Settings $settings
```

## Vérifier

- Sur la Pi : `ls -l ~/jobflow-backups` (une sauvegarde de la nuit, 7 au plus) et `tail ~/jobflow-backups/backup.log`.
- Sur le PC : `Get-Content "$env:USERPROFILE\JobFlow\sauvegardes\recuperation.log" -Tail 5`.

## Restaurer

Une sauvegarde se restaure dans une base **vide** (FR-010-11). Sur la Pi, avec la sauvegarde voulue dans `~/restauration.dump` (copiée depuis le PC par `scp` si la Pi a été réinstallée) :

```bash
cd ~/jobflow-prod
docker compose stop app                     # plus personne n'écrit pendant la restauration
docker compose exec -T db dropdb -U jobflow jobflow
docker compose exec -T db createdb -U jobflow jobflow
docker compose exec -T db pg_restore -U jobflow -d jobflow --no-owner < ~/restauration.dump
docker compose start app
```

⚠️ `dropdb` efface la base actuelle : faire d'abord `./backup.sh` si elle contient quelque chose à garder.

Au redémarrage, l'application voit les migrations déjà appliquées (« No pending migrations ») et sert les données restaurées.

## Essai de restauration (2026-10-01)

Sauvegarde de production copiée sur le PC, puis restaurée dans un PostgreSQL 18 jetable sur la Pi ; une Candidature de test (Entreprise, deux changements de statut, une pièce jointe) ajoutée, sauvegardée et restaurée dans une seconde base : comptes identiques (1 utilisateur, 1 Entreprise, 1 Candidature « Dev Backend @ Thales, INTERVIEW », 2 changements de statut, 1 pièce jointe), 4 migrations. Rotation vérifiée : sur 10 fichiers, les 7 plus récents restent (AC-010-08) ; récupération par le PC : 2 copiées puis 0 au passage suivant (AC-010-09) ; restauration (AC-010-10). La procédure « Restaurer » ci-dessus a été jouée telle quelle sur la production (vide) : « No pending migrations », `/api/health` 200, l'utilisateur unique conservé.
