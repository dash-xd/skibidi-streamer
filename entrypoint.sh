#!/usr/bin/env bash
set -e
CMD=${ENTRYPOINT:-"wrangler dev"}
echo "Entering Nix dev shell and running: $CMD"
exec nix develop . --command $CMD
