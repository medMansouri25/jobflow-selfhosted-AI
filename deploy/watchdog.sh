#!/bin/sh
# Surveillance de JobFlow (SPEC-012, FR-012-01), lancée toutes les 5 minutes par cron sur la Pi.
# Alerte après 2 échecs de suite (un redémarrage par ./deploy.sh ne déclenche rien), puis une seule
# fois au retour : pas de répétition tant que l'état ne change pas.

cd "$(dirname "$0")" || exit 1
STATE=.watchdog-failures
FAILURES=$(cat "$STATE" 2>/dev/null || echo 0)

if curl -fsS -m 10 http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
  [ "$FAILURES" -ge 2 ] && ./notify.sh "JobFlow répond de nouveau" "L'application est de nouveau joignable sur la Pi."
  echo 0 > "$STATE"
else
  FAILURES=$((FAILURES + 1))
  echo "$FAILURES" > "$STATE"
  [ "$FAILURES" -eq 2 ] && ./notify.sh "JobFlow ne répond plus" "La Pi ne joint plus l'application depuis 10 minutes. Voir : docker compose ps, docker compose logs app."
fi
exit 0
