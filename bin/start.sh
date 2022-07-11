#!/usr/bin/env bash

WORK_PATH="`(dirname \"${0}\")`"
WORK_PATH="`( cd \"${WORK_PATH}/../\" && pwd )`"
. "${WORK_PATH}/bin/lib.sh";

WORK_STAGE="local"

SWARM_SECRETS=(
)

MODE_AVALIBLE=(
    "update"
    "update_images"
    "up"
    "down"
    "clean_docker"
    "deploy"
    "deploy_prepare"
    "deploy_key"
)
#     "build"
SERVICE_AVALIBLE=(
    "backend"
)

# auto list avalible branch
BRANCH_AVALIBLE=(
    "master"
)

VOLUMES=(
)

# VOLUMES=(
#     "${FULL_PROJECT_ID}-backend_node_modules"
# )

MODE=${1}
SERVICE=${2}
BRANCH=${3}

HELP_DATA="==  ==  ==  ==
Stage: ${WORK_STAGE}
Branch: ${CURRENT_BRANCH}
==  ==  ==  ==
Mode: ${MODE}
Service: ${SERVICE}
Branch: ${BRANCH}
======================="

echo "${HELP_DATA}"

# function docker_dest(){
#     DOCKER_HOST="ssh://${DOCKER_HOST_deploy}" docker "${@}"
# }

function docker_compose_prepare(){
    show_line_breacker "docker_compose_prepare ${bldylw}start${txtrst}";
    DOCKER_COMPOSE_FILES=" --file ${WORK_PATH}/infrastructure/docker-compose.yml \
                           --file ${WORK_PATH}/infrastructure/${WORK_STAGE}.docker-compose.yml"
    DOCKER_COMPOSE_FILES_STACK=" --compose-file ${WORK_PATH}/infrastructure/docker-compose.yml \
                                 --compose-file ${WORK_PATH}/infrastructure/${WORK_STAGE}.docker-compose.yml"
    DOCKER_COMPOSE_COMMAND="docker-compose --project-name ${FULL_PROJECT_ID} --compatibility ${DOCKER_COMPOSE_FILES}";
    show_line_breacker "docker_compose_prepare ${bldgrn}finish${txtrst}";
}

# function update(){
#     show_line_breacker "update ${bldylw}start${txtrst}";
#     git checkout ${BRANCH} && git pull;
#     show_line_breacker "update ${bldgrn}finish${txtrst}";
# }

# function update_images(){
#     show_line_breacker "update_images ${bldylw}start${txtrst}";
#     docker images |grep -v REPOSITORY|awk '{print $1}'|xargs -L1 docker pull;
#     show_line_breacker "update_images ${bldgrn}finish${txtrst}";
# }

function volumes_create(){
    show_line_breacker "volume create ${bldylw}start${txtrst}";
    for VOLUME in ${VOLUMES[@]}
    do
        echo "Created $(docker volume create --name=${VOLUME}).";
    done
    show_line_breacker "volume create ${bldgrn}finish${txtrst}";
}

function network_create(){
    show_line_breacker "network create ${bldylw}start${txtrst}";
    echo "create ${PROJECT_ID}                  $(docker network create "${PROJECT_ID}"                  --driver overlay --attachable --internal || true)";
    echo "create ${PROJECT_ID}-${SUBPROJECT_ID} $(docker network create "${PROJECT_ID}-${SUBPROJECT_ID}" --driver overlay --attachable --internal || true)";
    echo "create ${PROJECT_ID}_ext              $(docker network create "${PROJECT_ID}_ext"              --driver overlay --attachable || true)";
    show_line_breacker "network create ${bldgrn}finish${txtrst}";
}

function network_remove(){
    show_line_breacker "network remove ${bldylw}start${txtrst}";
    echo "remove $(docker network rm "${PROJECT_ID}"                  || echo "${PROJECT_ID}")";
    echo "remove $(docker network rm "${PROJECT_ID}-${SUBPROJECT_ID}" || echo "${PROJECT_ID}-${SUBPROJECT_ID}")";
    echo "remove $(docker network rm "${PROJECT_ID}_ext"              || echo "${PROJECT_ID}_ext")";
    show_line_breacker "network remove ${bldgrn}finish${txtrst}";
}

# function build(){
#     network_create;
#     show_line_breacker "build ${bldylw}start${txtrst}";
#     ${DOCKER_COMPOSE_COMMAND} pull;
#     ${DOCKER_COMPOSE_COMMAND} up --build;
#     show_line_breacker "build ${bldgrn}finish${txtrst}";
# }

function up(){
    show_line_breacker "up ${bldylw}start${txtrst}";
    docker_compose_prepare;
    volumes_create;
    network_create;
    ${DOCKER_COMPOSE_COMMAND} up --build;
    show_line_breacker "up ${bldgrn}finish${txtrst}";
}

function down(){
    show_line_breacker "down ${bldylw}start${txtrst}";
    docker_compose_prepare;
    ${DOCKER_COMPOSE_COMMAND} down;
    sleep 3;
    network_remove;
    show_line_breacker "down ${bldgrn}finish${txtrst}";
}

function clean_docker(){
    show_line_breacker "docker clean ${bldylw}start${txtrst}";
    docker volume prune -f;
    show_line_breacker "docker clean ${bldgrn}finish${txtrst}";
}

function info(){
    echo "Avalible mode:"
    for mode in ${MODE_AVALIBLE[@]}
    do
        echo "  ${mode}";
    done
    echo "Service avalible:"
    for service in ${SERVICE_AVALIBLE[@]}
    do
        echo "  ${service}";
    done
    echo "Branch avalible:"
    for branch in ${BRANCH_AVALIBLE[@]}
    do
        echo "  ${branch}";
    done
    exit
}

function deploy_prepare(){
    show_line_breacker "deploy_prepare ${bldylw}start${txtrst}";
    WORK_STAGE="production";
    docker_compose_prepare;
    mkdir -p "${TEMP_PATH}"
    docker-compose ${DOCKER_COMPOSE_FILES} --project-name "${FULL_PROJECT_ID}" config | sed -E "s/cpus: ([0-9\\.]+)/cpus: '\\1'/" > "${TEMP_PATH}/compose.yml";
    show_line_breacker "deploy_prepare ${bldgrn}finish${txtrst}";
}

function deploy_network(){
    show_line_breacker "deploy_network create ${bldylw}start${txtrst}";
    echo "create ${PROJECT_ID}     $(docker_target network create "${PROJECT_ID}"                  --driver overlay --attachable --internal)";
    echo "create ${PROJECT_ID}     $(docker_target network create "${PROJECT_ID}-${SUBPROJECT_ID}" --driver overlay --attachable --internal)";
    echo "create ${PROJECT_ID}_ext $(docker_target network create "${PROJECT_ID}_ext"              --driver overlay --attachable)";
    show_line_breacker "deploy_network create ${bldgrn}finish${txtrst}";
}

function deploy(){
    show_line_breacker "deploy ${bldylw}start${txtrst}";
    deploy_prepare;
    sleep 2;
    docker_compose_target ${DOCKER_COMPOSE_FILES} pull;
    deploy_network;
    docker_target stack deploy --prune --compose-file "${TEMP_PATH}/compose.yml" "${FULL_PROJECT_ID}";
  # docker_target stack deploy --prune  ${DOCKER_COMPOSE_FILES_STACK} "${FULL_PROJECT_ID}"; # BUG!
    show_line_breacker "deploy ${bldgrn}finish${txtrst}";
}

function docker_target(){
    show_line_breacker "docker_target ${bldylw}start${txtrst}";
    docker \
        --tlsverify \
        --tlscacert="${SWARM_MASTER_CETRS_PATH}/ca.pem" \
        --tlscert="${SWARM_MASTER_CETRS_PATH}/cert.pem" \
        --tlskey="${SWARM_MASTER_CETRS_PATH}/key.pem" \
        -H="${SWARM_MASTER_HOST}" "$@"
    show_line_breacker "docker_target ${bldgrn}finish${txtrst}";
}

function docker_compose_target(){
    show_line_breacker "docker_compose_target";
    docker-compose \
        --tlsverify \
        --tlscacert="${SWARM_MASTER_CETRS_PATH}/ca.pem" \
        --tlscert="${SWARM_MASTER_CETRS_PATH}/cert.pem" \
        --tlskey="${SWARM_MASTER_CETRS_PATH}/key.pem" \
        -H="${SWARM_MASTER_HOST}" "$@"
    show_line_breacker "docker_compose_target ${bldgrn}finish${txtrst}";
}

function docker_create_secrets(){
    show_line_breacker "docker_create_secrets ${bldylw}start${txtrst}";
    for SECRET in ${SWARM_SECRETS[@]}
    do
        echo "secret create ${SECRET}";
        docker secret create "${SECRET}" "${CONFIG_PATH}/${SECRET}";
    done
    show_line_breacker "docker_create_secrets ${bldgrn}finish${txtrst}";
}

function docker_create_secrets_target(){
    show_line_breacker "docker_create_secrets_target ${bldylw}start${txtrst}";
    for SECRET in ${SWARM_SECRETS[@]}
    do
        echo "secret create ${SECRET}";
        docker_target secret create "${SECRET}" "${CONFIG_PATH}/${SECRET}";
    done
    show_line_breacker "docker_create_secrets_target ${bldgrn}finish${txtrst}";
}

case ${MODE} in
    "update")
        update;
        exit;
        ;;
    "update_images")
        update_images;
        exit;
        ;;
    # "build")
    #     build;
    #     exit;
    #     ;;
    "up")
        up;
        exit;
        ;;
    "down")
        down;
        exit;
        ;;
    "clean_docker")
        clean_docker;
        exit;
        ;;
    "deploy_key")
        docker_create_secrets;
        exit;
        ;;
    "deploy")
        deploy;
        exit;
        ;;
    "deploy_prepare")
        deploy_prepare;
        exit;
        ;;
    *)
        show_line_breacker "mode unknown: ${MODE}";
        info;
        ;;
esac
