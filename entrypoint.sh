#!/bin/bash
set -e
echo "Looking for Configuration ${SERVICE_NAME}-${STAGE} to swap..";
node configSwap.js $SERVICE_NAME $STAGE
eval "$@"
