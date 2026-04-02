#!/usr/bin/env bash
set -euo pipefail

# Load nix
if [ -f "$HOME/.nix-profile/etc/profile.d/nix.sh" ]; then
    . "$HOME/.nix-profile/etc/profile.d/nix.sh"
else
    echo "ERROR: nix.sh not found!"
    exit 1
fi

export PATH="$HOME/.nix-profile/bin:$PATH"

# Your real app root
cd /home/nixuser/app

CMD=${ENTRYPOINT:-wrangler dev}

echo "Using flake: /home/nixuser/flakes"
echo "Running: $CMD"

exec nix develop /home/nixuser/flakes#default --command bash -c "$CMD"
