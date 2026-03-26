FROM debian:12.13-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y \
        ca-certificates \
        curl \
        xz-utils \
        git \
        vim \
        bash \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -s /bin/bash nixuser \
    && mkdir -p /nix \
    && chown nixuser:nixuser /nix

USER nixuser
ENV USER=nixuser
ENV HOME=/home/nixuser
ENV PATH="$HOME/.nix-profile/bin:$PATH"

RUN curl -L https://nixos.org/nix/install | sh -s -- --no-daemon
RUN mkdir -p $HOME/.config/nix \
 && echo "experimental-features = nix-command flakes" > $HOME/.config/nix/nix.conf
RUN echo ". $HOME/.nix-profile/etc/profile.d/nix.sh" >> $HOME/.bashrc
RUN . $HOME/.nix-profile/etc/profile.d/nix.sh && nix --version
WORKDIR /workspace

CMD ["/bin/bash"]
