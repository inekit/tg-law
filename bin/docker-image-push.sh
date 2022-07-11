#!/usr/bin/env sh
docker \
    push \
    "${DOCKER_IMAGE_PREFIX}/${CHANNEL}:latest"
