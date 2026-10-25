#!/usr/bin/env bash
# Prepare a TransIP VPS (Ubuntu or Debian) for this site.
# Run once, as root, from any directory:
#   sudo bash deploy/bootstrap-vps.sh

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Draai dit script als root: sudo bash deploy/bootstrap-vps.sh" >&2
  exit 1
fi

if [[ ! -r /etc/os-release ]]; then
  echo "Geen /etc/os-release. Dit script verwacht Ubuntu of Debian." >&2
  exit 1
fi

# shellcheck disable=SC1091
. /etc/os-release

case "${ID}" in
  ubuntu | debian) ;;
  *)
    echo "Dit script installeert Docker op Ubuntu of Debian. TransIP levert die images voor een VPS." >&2
    exit 1
    ;;
esac

export DEBIAN_FRONTEND=noninteractive

ensure_swap() {
  local mem_kb
  mem_kb=$(awk '/MemTotal:/ { print $2 }' /proc/meminfo)
  if [[ "${mem_kb}" -ge 4000000 ]]; then
    return
  fi
  if swapon --noheadings --show | grep -q .; then
    return
  fi

  echo "Minder dan 4 GB geheugen en geen swap. Er komt 2 GB swap bij, anders kan de image-build de VPS stilleggen."
  if [[ ! -f /swapfile ]]; then
    if ! fallocate -l 2G /swapfile; then
      dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
    fi
    chmod 600 /swapfile
    mkswap /swapfile
  fi
  swapon /swapfile
  if ! grep -qE '^/swapfile[[:space:]]' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
}

install_docker() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    echo "Docker Compose is al geïnstalleerd."
  else
    apt-get update
    apt-get install -y ca-certificates curl
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL "https://download.docker.com/linux/${ID}/gpg" -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc

    local codename="${VERSION_CODENAME}"
    if [[ "${ID}" == "ubuntu" && -n "${UBUNTU_CODENAME:-}" ]]; then
      codename="${UBUNTU_CODENAME}"
    fi

    cat >/etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/${ID}
Suites: ${codename}
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  fi

  if command -v systemctl >/dev/null 2>&1 && [[ -d /run/systemd/system ]]; then
    systemctl enable --now docker
  else
    echo "systemd is hier niet actief. Op een TransIP-VPS start Docker via systemd vanzelf."
  fi
}

ensure_swap
install_docker

if [[ -n "${SUDO_USER:-}" && "${SUDO_USER}" != "root" ]]; then
  usermod -aG docker "${SUDO_USER}"
  echo "Gebruiker ${SUDO_USER} zit in de groep docker. Open een nieuwe SSH-sessie voordat je deploy/up.sh zonder sudo draait."
fi

cat <<'EOF'

Docker staat klaar.
Volgende stap, in de checkout van deze site:
  cp .env.example .env
  # vul AI_MODEL, AI_API_KEY en SITE_ADDRESS in
  bash deploy/up.sh

In het TransIP-controlepaneel laat de VPS-firewall 22, 80 en 443 door.
Het Linux-profiel doet dat al. Docker-poorten omzeilen ufw op de VPS;
de firewall in het controlepaneel is de grens die telt.
EOF
