# Base image
FROM debian:12.13-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install basic dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates curl xz-utils git bash \
 && rm -rf /var/lib/apt/lists/*

# Create user
RUN useradd -m -s /bin/bash nixuser

# Copy entrypoint
COPY entrypoint.sh /home/nixuser/entrypoint.sh
RUN chmod +x /home/nixuser/entrypoint.sh \
 && chown nixuser:nixuser /home/nixuser/entrypoint.sh

# Switch to non-root
USER nixuser
ENV HOME=/home/nixuser
WORKDIR /workspace
ENV PATH="$HOME/.nix-profile/bin:$PATH"

# Install Nix (skip SHA check)
RUN curl -L https://nixos.org/nix/install | sh -s -- --no-daemon --no-check-sigs

# Enable flakes
RUN mkdir -p $HOME/.config/nix \
 && echo "experimental-features = nix-command flakes" > $HOME/.config/nix/nix.conf

# Entrypoint
ENTRYPOINT ["/home/nixuser/entrypoint.sh"]
