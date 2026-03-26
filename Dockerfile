# Base image
FROM debian:12.13-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates curl xz-utils git bash gnupg \
 && rm -rf /var/lib/apt/lists/*

# Create a non-root user for Nix
RUN useradd -m -s /bin/bash nixuser

USER nixuser
ENV HOME=/home/nixuser
WORKDIR /workspace
ENV PATH="$HOME/.nix-profile/bin:$PATH"

# Download Nix binary tarball (no SHA check, safer for ephemeral builds)
RUN curl -L -o $HOME/nix.tar.xz \
      https://releases.nixos.org/nix/nix-2.34.4/nix-2.34.4-x86_64-linux.tar.xz \
 && mkdir -p $HOME/nix-unpack \
 && tar -xJf $HOME/nix.tar.xz -C $HOME/nix-unpack \
 && $HOME/nix-unpack/*/install --no-daemon \
 && rm -rf $HOME/nix.tar.xz $HOME/nix-unpack

# Configure Nix for local user and enable flakes
RUN mkdir -p $HOME/.config/nix \
 && echo "experimental-features = nix-command flakes" > $HOME/.config/nix/nix.conf \
 && echo "build-users-group =" >> $HOME/.config/nix/nix.conf

# Ensure shell sees Nix binaries
ENV PATH="$HOME/.nix-profile/bin:$PATH"

# Copy entrypoint
COPY entrypoint.sh $HOME/entrypoint.sh
RUN chmod +x $HOME/entrypoint.sh

ENTRYPOINT ["$HOME/entrypoint.sh"]
