# Base image
FROM debian:12.13-slim
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    ca-certificates curl xz-utils git bash \
 && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash nixuser
USER nixuser
ENV HOME=/home/nixuser
WORKDIR /workspace
ENV PATH="$HOME/.nix-profile/bin:$PATH"

RUN curl -L https://releases.nixos.org/nix/nix-2.34.3/install | sh -s -- --no-daemon

RUN mkdir -p $HOME/.config/nix \
 && echo "experimental-features = nix-command flakes" > $HOME/.config/nix/nix.conf

COPY entrypoint.sh /home/nixuser/entrypoint.sh
RUN chmod +x /home/nixuser/entrypoint.sh

ENTRYPOINT ["/home/nixuser/entrypoint.sh"]
