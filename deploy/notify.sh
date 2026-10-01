#!/bin/sh
# Alerte sur le téléphone par ntfy (SPEC-012). Usage : notify.sh "Titre" "Message"
# Le canal secret NTFY_TOPIC vient de l'environnement ou de ~/jobflow-prod/.env (BR-012-01).
# Une alerte ne contient jamais de donnée personnelle (BR-012-02) et ne fait jamais échouer
# le script qui l'appelle (BR-012-03) : sans canal ou sans réseau, elle est seulement journalisée.

TOPIC="${NTFY_TOPIC:-}"
if [ -z "$TOPIC" ] && [ -f "$HOME/jobflow-prod/.env" ]; then
  TOPIC=$(sed -n 's/^NTFY_TOPIC=//p' "$HOME/jobflow-prod/.env" | tr -d '"' | tail -n 1)
fi

echo "$(date -Is) ALERTE $1 : $2"
[ -n "$TOPIC" ] || exit 0

# Envoi en JSON : titre et message accentués passent tels quels (les en-têtes HTTP n'acceptent pas l'UTF-8).
printf '{"topic":"%s","title":"%s","message":"%s","priority":4,"tags":["warning"]}' "$TOPIC" "$1" "$2" |
  curl -fsS -m 15 -H "Content-Type: application/json" --data-binary @- https://ntfy.sh >/dev/null ||
  echo "$(date -Is) envoi de l'alerte impossible"
exit 0
