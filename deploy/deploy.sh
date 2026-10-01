#!/bin/sh
# Met à jour JobFlow sur la Pi (SPEC-010, FR-010-07 / 08), lancé à la main dans ~/jobflow-prod :
#   ./deploy.sh               dernière image publiée (latest)
#   ./deploy.sh sha-1a2b3c4   une version précise, pour revenir en arrière
set -eu
cd "$(dirname "$0")"

VERSION="${1:-latest}"
IMAGE="ghcr.io/medmansouri25/jobflow-selfhosted-ai"

# Version qui tourne maintenant : celle à proposer en cas de problème (BR-010-03).
REVISION=$(docker inspect -f '{{index .Config.Labels "org.opencontainers.image.revision"}}' jobflow-prod-app-1 2>/dev/null || true)
PREVIOUS=""
[ -n "$REVISION" ] && PREVIOUS="sha-$(echo "$REVISION" | cut -c1-7)"

# Téléchargement d'abord : une version introuvable ne touche à rien.
docker pull "$IMAGE:$VERSION"

# Sauvegarde avant les éventuelles migrations de la nouvelle version.
./backup.sh

# La version choisie est gardée dans .env : un redémarrage de la Pi relance la même.
sed -i '/^JOBFLOW_IMAGE=/d; /^JOBFLOW_VERSION=/d' .env
echo "JOBFLOW_VERSION=$VERSION" >> .env
docker compose up -d app

echo "Démarrage de $VERSION…"
for _ in $(seq 1 60); do
  case "$(docker inspect -f '{{.State.Health.Status}}' jobflow-prod-app-1 2>/dev/null)" in
    healthy)
      echo "JobFlow $VERSION est en ligne."
      exit 0 ;;
  esac
  [ "$(docker inspect -f '{{.State.Running}}' jobflow-prod-app-1)" = true ] || break
  sleep 3
done

echo "⚠️  JobFlow $VERSION n'est pas en bonne santé. Journal : docker compose logs app"
[ -n "$PREVIOUS" ] && echo "    Retour à la version précédente : ./deploy.sh $PREVIOUS"
exit 1
