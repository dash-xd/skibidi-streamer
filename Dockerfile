# Base image
FROM debian:12.13-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates curl xz-utils git bash gnupg \
 && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -s /bin/bash nixuser
COPY entrypoint.sh /home/nixuser/entrypoint.sh
RUN chmod +x /home/nixuser/entrypoint.sh \
    && chown nixuser:nixuser /home/nixuser/entrypoint.sh

USER nixuser
ENV HOME=/home/nixuser
WORKDIR /workspace

# Nix environment variables
ENV NIX_INSTALLER_NO_SANDBOX=1
ENV NIX_DIR=$HOME/.nix
ENV NIX_USER_PROFILE_DIR=$HOME/.nix-profile
ENV PATH=$HOME/.nix-profile/bin:$PATH

# Download and install Nix (single-user, non-root)
RUN curl -L -o $HOME/nix.tar.xz https://releases.nixos.org/nix/nix-2.34.4/nix-2.34.4-x86_64-linux.tar.xz \
 && mkdir -p $HOME/nix-unpack \
 && tar -xJf $HOME/nix.tar.xz -C $HOME/nix-unpack \
 && $HOME/nix-unpack/*/install --no-daemon --no-sudo --yes --nix-dir=$HOME/.nix \
 && rm -rf $HOME/nix.tar.xz $HOME/nix-unpack

# Force populate ~/.nix-profile/bin with nix command
RUN mkdir -p $HOME/.nix-profile/bin \
 && ln -s $HOME/.nix/store/*nix-*/bin/nix $HOME/.nix-profile/bin/nix

# Create profile.d/nix.sh so non-login shells see nix
RUN mkdir -p $HOME/.nix-profile/etc/profile.d \
 && echo 'export NIX_DIR=$HOME/.nix' > $HOME/.nix-profile/etc/profile.d/nix.sh \
 && echo 'export PATH=$HOME/.nix-profile/bin:$PATH' >> $HOME/.nix-profile/etc/profile.d/nix.sh \
 && chmod +x $HOME/.nix-profile/etc/profile.d/nix.sh

# Configure Nix for single-user and enable flakes
RUN mkdir -p $HOME/.config/nix \
 && echo "experimental-features = nix-command flakes" > $HOME/.config/nix/nix.conf \
 && echo "build-users-group =" >> $HOME/.config/nix/nix.conf

# Use bash as shell so we can source nix.sh
SHELL ["/bin/bash", "-c"]

# Ensure nix.sh is loaded for all non-login shells
ENV BASH_ENV=$HOME/.nix-profile/etc/profile.d/nix.sh

ENTRYPOINT ["/home/nixuser/entrypoint.sh"]
