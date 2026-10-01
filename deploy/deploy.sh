#!/bin/sh
# Met à jour JobFlow sur la Pi (SPEC-010, FR-010-07 / 08), lancé à la main dans ~/jobflow-prod :
#   ./deploy.sh               dernière image publiée (latest)
#   ./deploy.sh sha-1a2b3c4   une version précise, pour revenir en arrière
set -eu
cd "$(dirname "$0")"

VERSION="${1:-latest}"
IMAGE="ghcr.io/medmansouri25/jobflow-selfhosted-ai"

# Dernière version qui a tourné en bonne santé : celle à proposer en cas de problème (BR-010-03).
PREVIOUS=$(cat .last-good 2>/dev/null || true)

# Téléchargement d'abord : une version introuvable ne touche à rien.
docker pull "$IMAGE:$VERSION"

# Sauvegarde avant les éventuelles migrations de la nouvelle version.
BACKUP=$(./backup.sh | sed -n 's/.* sauvegarde \([^ ]*\) .*/\1/p')

# La version choisie est gardée dans .env : un redémarrage de la Pi relance la même.
# Tout passe par sed : un .env sans retour à la ligne final ne se recolle pas à la ligne ajoutée.
sed -i "/^JOBFLOW_IMAGE=/d; /^JOBFLOW_VERSION=/d; \$a JOBFLOW_VERSION=$VERSION" .env
docker compose up -d app || true

echo "Démarrage de $VERSION…"
for _ in $(seq 1 60); do
  case "$(docker inspect -f '{{.State.Health.Status}}' jobflow-prod-app-1 2>/dev/null)" in
    healthy)
      REVISION=$(docker inspect -f '{{index .Config.Labels "org.opencontainers.image.revision"}}' jobflow-prod-app-1)
      case "$REVISION" in
        "" | *[!0-9a-f]*) ;;
        *) echo "sha-$(echo "$REVISION" | cut -c1-7)" > .last-good ;;
      esac
      echo "JobFlow $VERSION est en ligne."
      exit 0 ;;
  esac
  # Arrêté, ou en boucle de redémarrage (migration en échec) : inutile d'attendre davantage.
  [ "$(docker inspect -f '{{.State.Status}}' jobflow-prod-app-1 2>/dev/null)" = running ] || break
  sleep 3
done

echo "⚠️  JobFlow $VERSION n'est pas en bonne santé. Journal : docker compose logs app"
echo "    Sauvegarde faite juste avant : ~/jobflow-backups/$BACKUP"
echo "    Si une migration a échoué, restaurer d'abord cette sauvegarde (docs/runbooks/backups.md, « Restaurer »)."
[ -n "$PREVIOUS" ] && echo "    Retour à la dernière version saine : ./deploy.sh $PREVIOUS"
exit 1
