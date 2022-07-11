#!/usr/bin/env sh
echo -n $DOCKER_REGISTRY_PASSWORD | \
    docker \
        login \
        -u $DOCKER_REGISTRY_LOGIN \
        --password-stdin $DOCKER_REGISTRY_HOSTNAME
