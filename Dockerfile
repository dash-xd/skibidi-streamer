# Base image
FROM debian:12.13-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install basic dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates curl xz-utils git bash \
 && rm -rf /var/lib/apt/lists/*

# Create user
RUN useradd -m -s /bin/bash nixuser
USER nixuser
ENV HOME=/home/nixuser
WORKDIR /workspace
ENV PATH="$HOME/.nix-profile/bin:$PATH"

# -----------------------------
# Deterministic Nix install
# -----------------------------
# Pin Nix version and SHA
ENV NIX_VERSION=2.34.4
ENV NIX_SHA256=595669eb6db6117135ca8ba6667b273eaf980a47523a92e61ed963556cd547b8

# Download and extract Nix deterministically
RUN curl -L https://releases.nixos.org/nix/nix-${NIX_VERSION}/nix-${NIX_VERSION}-x86_64-linux.tar.xz \
    -o /tmp/nix.tar.xz \
 && echo "${NIX_SHA256}  /tmp/nix.tar.xz" | sha256sum -c - \
 && mkdir -p $HOME/.nix-profile \
 && tar -xJf /tmp/nix.tar.xz -C $HOME/.nix-profile --strip-components=1 \
 && rm /tmp/nix.tar.xz

# Enable flakes
RUN mkdir -p $HOME/.config/nix \
 && echo "experimental-features = nix-command flakes" > $HOME/.config/nix/nix.conf

COPY entrypoint.sh $HOME/entrypoint.sh
RUN chmod +x $HOME/entrypoint.sh

# Use it as ENTRYPOINT
ENTRYPOINT ["$HOME/entrypoint.sh"]
