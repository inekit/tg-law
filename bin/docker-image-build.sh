#!/usr/bin/env sh
docker \
    buildx build \
    --pull \
    --platform linux/amd64 \
    --build-arg "CHANNEL=$CHANNEL" \
    --build-arg "CI_COMMIT_BRANCH=$CI_COMMIT_BRANCH" \
    --build-arg "CI_COMMIT_BRANCH=$CI_COMMIT_BRANCH" \
    --file "./infrastructure/${SERVICE}/main.Dockerfile" \
    --tag "${DOCKER_IMAGE_PREFIX}/${CHANNEL}:latest" \
    ./
