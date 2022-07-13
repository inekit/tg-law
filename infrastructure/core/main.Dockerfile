FROM node:lts as prepare_base

ARG CHANNEL=production
ARG CI_COMMIT_BRANCH=undefined

ENV DEBIAN_FRONTEND="noninteractive" \
    PROJECT="meta-forest" \
    SUBPROJECT="bot-subscription-checker" \
    SERVICE="core" \
    CI_COMMIT_BRANCH="${CI_COMMIT_BRANCH}" \
    CHANNEL="${CHANNEL}"

LABEL project="${PROJECT}" \
    subproject="${SUBPROJECT}" \
    channel="${CHANNEL}" \
    stage="prepare"

ENV APP_PATH="/opt/${PROJECT}/${SUBPROJECT}" \
    APP_PROJECT_ID="${PROJECT}-${SUBPROJECT}" \
    APP_PORT=3000 \
    APP_USER_NAME="appserver-user" \
    APP_GROUP_NAME="appserver-group" \
    APP_GROUP_ID=1500 \
    APP_USER_ID=1500

RUN mkdir -p "${APP_PATH}/node_modules/.bin" \
    && groupadd -g "${APP_GROUP_ID}" "${APP_GROUP_NAME}" \
    && useradd -u "${APP_USER_ID}" -d "${APP_PATH}" -g "${APP_GROUP_NAME}" "${APP_USER_NAME}" \
    && chown -R "${APP_USER_NAME}":"${APP_GROUP_NAME}" "${APP_PATH}"

USER "${APP_USER_NAME}"

WORKDIR "${APP_PATH}"

ENV PATH="${PATH}:${APP_PATH}/node_modules/.bin"

COPY --chown="${APP_USER_NAME}:${APP_GROUP_NAME}" \
[    \
    "package-lock.json", \
    "package.json", \
    "${APP_PATH}/" \
]

FROM prepare_base as prepare_deps

RUN npm ci --only=prod

FROM prepare_deps as work

COPY --chown="${APP_USER_NAME}:${APP_GROUP_NAME}" \
[    \
    "data-source.js", \
    "${APP_PATH}/" \
]

COPY --chown="${APP_USER_NAME}:${APP_GROUP_NAME}" \
[    \
    "Titles/", \
    "${APP_PATH}/Titles" \
]

COPY --chown="${APP_USER_NAME}:${APP_GROUP_NAME}" \
[    \
    "src/", \
    "${APP_PATH}/src" \
]

WORKDIR "${APP_PATH}/"

CMD ["npm","run","start"]

LABEL stage="work"

ENV APP_SERVICE_ID="${SERVICE}" \
    APP_PROJECT_ID="${APP_PROJECT_ID}-${APP_SERVICE_ID}"

ARG CI_COMMIT_SHA=undefined
ENV CI_COMMIT_SHA="${CI_COMMIT_SHA}"

LABEL service="${SERVICE}" \
    CI_COMMIT_SHA="${CI_COMMIT_SHA}"
