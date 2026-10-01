# Alertes sur le téléphone

Alertes de la Pi et du PC par **ntfy** (SPEC-012). Une alerte ne contient jamais de donnée personnelle : seulement l'événement.

## Recevoir les alertes

1. Installer l'appli **ntfy** sur l'iPhone (App Store, gratuite).
2. « + » → **Subscribe to topic** → saisir le nom du canal (valeur de `NTFY_TOPIC` dans `~/jobflow-prod/.env` sur la Pi) → serveur par défaut `ntfy.sh`.
3. Autoriser les notifications.

Le nom du canal est le seul secret : quiconque le connaît peut lire et écrire les alertes. Pour en changer, générer un nouveau nom (`jobflow-$(openssl rand -hex 12)`), le mettre dans `~/jobflow-prod/.env` (Pi) et dans `%USERPROFILE%\JobFlow\ntfy-topic.txt` (PC), puis s'abonner au nouveau canal.

## Ce qui déclenche une alerte

| Alerte | Où | Quand |
|---|---|---|
| JobFlow ne répond plus / répond de nouveau | Pi, `watchdog.sh` (cron toutes les 5 min) | 2 échecs de suite de `/api/health` (10 min) ; une seule fois, puis au retour |
| Sauvegarde JobFlow échouée | Pi, `backup.sh` (cron 3 h 30) | la sauvegarde de la nuit échoue (le fichier partiel est supprimé) |
| Pas de sauvegarde récente | Pi, `daily-check.sh` (cron 8 h) | dernière sauvegarde de plus de 26 h |
| Carte SD presque pleine | Pi, `daily-check.sh` | disque rempli à plus de 85 % |
| Sauvegardes JobFlow non récupérées | PC, `pull-backups.ps1` | le PC ne joint pas la Pi ou une copie échoue |

Journal des alertes de la Pi : `~/jobflow-backups/alerts.log`.

## Installer sur la Pi

```bash
cd ~/jobflow-prod          # notify.sh, watchdog.sh, daily-check.sh, backup.sh copiés depuis deploy/
chmod 700 notify.sh watchdog.sh daily-check.sh backup.sh
echo "NTFY_TOPIC=jobflow-$(openssl rand -hex 12)" >> .env
./notify.sh "Test JobFlow" "Les alertes arrivent bien."
(crontab -l; echo '*/5 * * * * $HOME/jobflow-prod/watchdog.sh >> $HOME/jobflow-backups/alerts.log 2>&1'; echo '0 8 * * * $HOME/jobflow-prod/daily-check.sh >> $HOME/jobflow-backups/alerts.log 2>&1') | crontab -
```

## Essai (2026-10-01)

Message de test reçu ; application arrêtée → « ne répond plus » une seule fois malgré 3 vérifications, puis « répond de nouveau » ; base arrêtée pendant `backup.sh` → « Sauvegarde JobFlow échouée », sans fichier partiel restant (après correction).
