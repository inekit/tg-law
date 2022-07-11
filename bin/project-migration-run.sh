#!/usr/bin/env bash

WORK_PATH="`(dirname \"${0}\")`"
WORK_PATH="`( cd \"${WORK_PATH}/../\" && pwd )`"

cd "${WORK_PATH}/migrations" && npm run debug:env;
# cd "${WORK_PATH}/migrations" && npm run migration:run;
EX_CODE=$?

exit ${EX_CODE};
