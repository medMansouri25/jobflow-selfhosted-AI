#!/bin/sh
# Vérification quotidienne de la Pi (SPEC-012, FR-012-02 et 03), lancée chaque matin par cron.

cd "$(dirname "$0")" || exit 1

# Dernière sauvegarde de plus de 26 h : la sauvegarde de la nuit n'a pas eu lieu.
LATEST=$(ls -1t "$HOME"/jobflow-backups/jobflow-*.dump 2>/dev/null | head -n 1)
if [ -z "$LATEST" ] || [ -n "$(find "$LATEST" -mmin +1560)" ]; then
  ./notify.sh "Pas de sauvegarde récente" "Aucune sauvegarde de la base depuis plus de 26 h. Voir ~/jobflow-backups/backup.log."
fi

# Carte SD remplie à plus de 85 %.
USED=$(df -P / | awk 'NR == 2 { gsub("%", "", $5); print $5 }')
if [ "${USED:-0}" -gt 85 ]; then
  ./notify.sh "Carte SD presque pleine" "La carte SD de la Pi est remplie à ${USED} %. Piste : docker image prune."
fi
exit 0
