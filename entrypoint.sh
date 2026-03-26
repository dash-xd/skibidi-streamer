#!/usr/bin/env bash
set -e
if [ -f "$HOME/.nix-profile/etc/profile.d/nix.sh" ]; then
    . "$HOME/.nix-profile/etc/profile.d/nix.sh"
else
    echo "ERROR: nix.sh not found!"
    exit 1
fi
CMD=${ENTRYPOINT:-"wrangler dev"}
echo "Entering Nix dev shell and running: $CMD"
nix develop . --command $CMD
