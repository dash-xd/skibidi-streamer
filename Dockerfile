FROM ubuntu:25.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update \
    && apt upgrade -y \
    && apt install -y ca-certificates curl xz-utils git vim \
    && /sbin/useradd -m nixuser \
    && mkdir /nix \
    && chown nixuser:nixuser /nix \
    && apt clean

COPY entrypoint.sh /home/nixuser/entrypoint.sh

RUN chown nixuser:nixuser /home/nixuser/entrypoint.sh \
    && chmod 755 /home/nixuser/entrypoint.sh

# Switch to nixuser
USER nixuser
ENV USER=nixuser
ENV PATH="/home/nixuser/.nix-profile/bin:${PATH}"

# Install Nix
RUN curl -sL https://releases.nixos.org/nix/nix-2.34.3/install \
    | sh -s -- --no-daemon

# Ensure nix env loads
RUN echo ". /home/nixuser/.nix-profile/etc/profile.d/nix.sh" \
    >> /home/nixuser/.bashrc

# Copy config + flakes
COPY --chown=nixuser:nixuser conf/nix.conf /home/nixuser/.config/nix/nix.conf
COPY --chown=nixuser:nixuser flakes /home/nixuser/flakes

# Permissions
RUN chmod -R 755 /home/nixuser/.config/nix \
    && chmod -R 755 /home/nixuser/flakes

# Entrypoint
ENTRYPOINT ["/home/nixuser/entrypoint.sh"]
