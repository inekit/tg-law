#!/usr/bin/env bash

WORK_PATH="`(dirname \"${0}\")`";
WORK_PATH="`( cd \"${WORK_PATH}/../\" && pwd )`";

. "${WORK_PATH}/bin/lib-colors.sh";

CONFIG_PATH="${WORK_PATH}/.config";
TEMP_PATH="${WORK_PATH}/.tmp";
COMPOSE_TEMP_PATH="${TEMP_PATH}";

CURRENT_BRANCH="`git branch --show-current`"

DOCKER_DEPLOY_ENV_FILE="swarm.deploy.env";
CONFIG_ENV_FILE="config.env";

WORK_STAGE="local";

function show_line_breacker(){
    local STUB_DATA=""
    if [ -z ${1+x} ] ;
    then
        local STUB_DATA="--|  |--";
    else
        local STUB_DATA="--| ${1} |--";
    fi
    echo "[ `date` ] ${STUB_DATA}";
}

function config_load(){
    local ENV_FILE="${1}";
    show_line_breacker " ${bldylw}start${txtrst} config_load ${ENV_FILE}";
    source "${CONFIG_PATH}/${ENV_FILE}";
    show_line_breacker "${bldgrn}finish${txtrst} config_load ${ENV_FILE}";
}

config_load "${CONFIG_ENV_FILE}";
config_load "${DOCKER_DEPLOY_ENV_FILE}";

function show_exit_code(){
    local EXIT_CODE=${1};
    local EXIT_TEXT="";
    if [ ${EXIT_CODE} -eq 0 ]
    then
        local EXIT_TEXT="${bldgrn}exit: 0${txtrst}";
    else
        local EXIT_TEXT="${bldred}exit: ${EXIT_CODE}${txtrst}";
    fi
    show_line_breacker "${EXIT_TEXT}";
}
