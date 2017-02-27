#!/bin/bash
set -e
echo "Looking for Configuration ${SERVICE_NAME}-${STAGE} to swap..";
node configSwap.js $SERVICE_NAME $STAGE

UNAME=`uname`

if [[ "$UNAME" == "Darwin" ]]; then
    IP=`ipconfig getifaddr en0`
else
    IP=`hostname --ip-address`
fi
export CONTAINER_ADDR=$IP

# DEBUG
export DEBUG=discovery*
eval "$@"
