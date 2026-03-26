# Base image
FROM debian:12.13-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates curl xz-utils git bash gnupg \
 && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -s /bin/bash nixuser

USER nixuser
ENV HOME=/home/nixuser
WORKDIR /workspace
ENV PATH="$HOME/.nix-profile/bin:$PATH"

# Download and install Nix from official binary
RUN curl -L -o $HOME/nix.tar.xz \
      https://releases.nixos.org/nix/nix-2.34.4/nix-2.34.4-x86_64-linux.tar.xz \
 && mkdir -p $HOME/nix-unpack \
 && tar -xJf $HOME/nix.tar.xz -C $HOME/nix-unpack \
 && $HOME/nix-unpack/*/install --no-daemon \
 && rm -rf $HOME/nix.tar.xz $HOME/nix-unpack

# Enable flakes
RUN mkdir -p $HOME/.config/nix \
 && echo "experimental-features = nix-command flakes" > $HOME/.config/nix/nix.conf

# Copy entrypoint
COPY entrypoint.sh $HOME/entrypoint.sh
RUN chmod +x $HOME/entrypoint.sh

ENTRYPOINT ["$HOME/entrypoint.sh"]
