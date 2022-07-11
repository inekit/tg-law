#!/usr/bin/env sh

docker \
    --tlsverify \
    --tlscacert "$DOCKER_SWARM_CACERT" \
    --tlscert "$DOCKER_SWARM_CERT" \
    --tlskey "$DOCKER_SWARM_KEY" \
    --host "$DOCKER_SWARM_HOST" \
    network \
    create \
    "$PROJECT_ID" \
    --driver overlay \
    --attachable \
    --internal \
    || true;

docker \
    --tlsverify \
    --tlscacert "$DOCKER_SWARM_CACERT" \
    --tlscert "$DOCKER_SWARM_CERT" \
    --tlskey "$DOCKER_SWARM_KEY" \
    --host "$DOCKER_SWARM_HOST" \
    network \
    create \
    "$PROJECT_ID-$SUBPROJECT_ID" \
    --driver overlay \
    --attachable \
    --internal \
    || true;

docker \
    --tlsverify \
    --tlscacert "$DOCKER_SWARM_CACERT" \
    --tlscert "$DOCKER_SWARM_CERT" \
    --tlskey "$DOCKER_SWARM_KEY" \
    --host "$DOCKER_SWARM_HOST" \
    network \
    create \
    "$PROJECT_ID"_ext \
    --driver overlay \
    --attachable \
    || true;
