#!/usr/bin/env bash
set -e
CMD=${ENTRYPOINT:-"wrangler dev"}
echo "Running command: $CMD"
exec $CMD
