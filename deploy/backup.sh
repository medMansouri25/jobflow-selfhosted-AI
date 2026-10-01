#!/bin/sh
# Sauvegarde nocturne de la base de production (SPEC-010, FR-010-09), lancée par cron sur la Pi.
# Une sauvegarde par nuit au format personnalisé de pg_dump ; les 7 plus récentes sont gardées.
set -eu
umask 077  # les sauvegardes contiennent toutes les données : lisibles par mohammed seul

DIR="$HOME/jobflow-backups"
mkdir -p "$DIR"
FILE="$DIR/jobflow-$(date +%Y-%m-%d_%H%M).dump"

# Une sauvegarde en échec prévient le téléphone (SPEC-012, FR-012-02) et ne laisse pas de fichier partiel.
ALERT="$(cd "$(dirname "$0")" && pwd)/notify.sh"
trap 'status=$?; if [ "$status" -ne 0 ]; then rm -f "$FILE.partial"; "$ALERT" "Sauvegarde JobFlow échouée" "La sauvegarde nocturne de la Pi a échoué (code $status). Voir ~/jobflow-backups/backup.log."; fi' EXIT

cd "$HOME/jobflow-prod"
# Écrite sous un nom temporaire : une sauvegarde interrompue n'est jamais prise pour une bonne.
docker compose exec -T db pg_dump -U jobflow -d jobflow --format=custom > "$FILE.partial"
mv "$FILE.partial" "$FILE"

ls -1t "$DIR"/jobflow-*.dump | tail -n +8 | xargs -r rm --
echo "$(date -Is) sauvegarde $(basename "$FILE") ($(du -h "$FILE" | cut -f1))"
