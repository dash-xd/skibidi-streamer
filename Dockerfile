# Use Ubuntu as the base image
FROM ubuntu:25.04

# Install required dependencies, Vim, and create the nixuser
RUN apt update \
    && apt upgrade -y \
    && apt install -y ca-certificates curl xz-utils git vim \
    && /sbin/useradd -m nixuser \
    && mkdir /nix \
    && chown nixuser /nix \
    && apt clean

# Switch to nixuser
USER nixuser
ENV USER=nixuser
ENV PATH="/home/nixuser/.nix-profile/bin:${PATH}"

# Install Nix package manager
RUN curl -sL https://nixos.org/nix/install | sh -s -- --no-daemon

# Ensure the environment variables are set by sourcing the nix profile
RUN echo ". /home/nixuser/.nix-profile/etc/profile.d/nix.sh" >> /home/nixuser/.bashrc

# Verify that Nix was installed
RUN . /home/nixuser/.nix-profile/etc/profile.d/nix.sh && nix --version

# Clone the repository into the dotfiles directory
RUN git clone https://github.com/dash-xd/home.git /home/nixuser/dotfiles

# Symlink everything except the .git directory into the home directory
RUN find /home/nixuser/dotfiles -maxdepth 1 ! -name ".git" -exec ln -sf {} /home/nixuser/ \;

# Change ownership of symlinked files to nixuser
RUN chown -R nixuser:nixuser /home/nixuser/*

# Copy the pre-made nix.conf file to the nixuser's configuration directory
COPY --chown=nixuser:nixuser conf/nix.conf /home/nixuser/.config/nix/nix.conf

# Copy the flakes directory into the nixuser's home directory
COPY --chown=nixuser:nixuser flakes /home/nixuser/flakes

# Ensure proper permissions and prepare the environment
RUN chmod -R 755 /home/nixuser/.config/nix \
    && chmod -R 755 /home/nixuser/flakes \
    && . /home/nixuser/.nix-profile/etc/profile.d/nix.sh

# Default command to keep the container running for interactive use
CMD ["/bin/bash"]
