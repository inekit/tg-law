#!/usr/bin/env sh

echo "CHANNEL: ${CHANNEL}";

/usr/bin/docker-compose \
    --tlsverify \
    --tlscacert "$DOCKER_SWARM_CACERT" \
    --tlscert "$DOCKER_SWARM_CERT" \
    --tlskey "$DOCKER_SWARM_KEY" \
    --host "$DOCKER_SWARM_HOST" \
    --file "${COMPOSE_TEMP_PATH}/compose.yml" \
    pull
