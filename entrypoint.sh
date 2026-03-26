#!/usr/bin/env bash
set -e
export PATH=$HOME/.nix-profile/bin:$PATH
CMD=${ENTRYPOINT:-"wrangler dev"}
echo "Running command: $CMD"
exec $CMD
