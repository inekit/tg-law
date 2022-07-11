#!/usr/bin/env sh

# BUG FiX merge ports!

# apk update \
#     && apk add \
#            --no-cache \
#            --virtual \
#            .docker-compose-deps \
#            curl \
#            docker-cli \
#            gcc \
#            libc-dev \
#            libffi-dev \
#            make \
#            openssl-dev \
#            py-pip \
#            py3-pip \
#            python3 \
#            python3-dev \
#     && pip install docker-compose;

mkdir -p "${COMPOSE_TEMP_PATH}" ;

echo "CHANNEL: ${CHANNEL}";

/usr/bin/docker-compose \
    --file "./infrastructure/docker-compose.yml" \
    --file "./infrastructure/${CHANNEL}.docker-compose.yml" \
    --project-name "$FULL_PROJECT_ID" \
    config \
    | sed -E "s/cpus: ([0-9\\.]+)/cpus: '\\1'/" \
          > "${COMPOSE_TEMP_PATH}/compose.yml";
