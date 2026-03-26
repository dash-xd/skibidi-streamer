#!/usr/bin/env bash
set -e

# Source nix.sh
if [ -f "$HOME/.nix-profile/etc/profile.d/nix.sh" ]; then
    . "$HOME/.nix-profile/etc/profile.d/nix.sh"
else
    echo "ERROR: nix.sh not found!"
    exit 1
fi

# Explicitly export PATH just in case
export PATH="$HOME/.nix-profile/bin:$PATH"

CMD=${ENTRYPOINT:-"wrangler dev"}
echo "Entering Nix dev shell and running: $CMD"

# Run flake development shell
exec nix develop . --command "$CMD"
