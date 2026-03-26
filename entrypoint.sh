#!/usr/bin/env bash
set -e
. $HOME/.nix-profile/etc/profile.d/nix.sh
CMD=${ENTRYPOINT:-"wrangler dev"}
echo "Entering Nix dev shell and running: $CMD"
exec nix develop . --command $CMD
