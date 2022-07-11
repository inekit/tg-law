#!/usr/bin/env sh

docker \
    --tlsverify \
    --tlscacert "$DOCKER_SWARM_CACERT" \
    --tlscert "$DOCKER_SWARM_CERT" \
    --tlskey "$DOCKER_SWARM_KEY" \
    --host "$DOCKER_SWARM_HOST" \
    stack \
    deploy \
    --prune \
    --compose-file "${COMPOSE_TEMP_PATH}/compose.yml" \
    --with-registry-auth \
    "${FULL_PROJECT_ID}"
