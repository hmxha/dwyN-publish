#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

log() {
  printf '[install-env] %s\n' "$*"
}

die() {
  printf '[install-env] ERROR: %s\n' "$*" >&2
  exit 1
}

[ "${EUID:-$(id -u)}" -eq 0 ] || die "run with: sudo bash install-env.sh"
[ -r /etc/os-release ] || die "cannot identify the operating system"
# shellcheck disable=SC1091
. /etc/os-release
[ "${ID:-}" = "rocky" ] || die "this installer supports Rocky Linux only"
case "${VERSION_ID:-}" in
  9|9.*) ;;
  *) die "Rocky Linux 9 is required" ;;
esac

log "installing system prerequisites"
dnf -y install dnf-plugins-core git curl gawk sed findutils util-linux tar unzip openssl grubby

log "permanently disabling SELinux"
if [ -f /etc/selinux/config ]; then
  if grep -q '^SELINUX=' /etc/selinux/config; then
    sed -i 's/^SELINUX=.*/SELINUX=disabled/' /etc/selinux/config
  else
    printf '\nSELINUX=disabled\n' >>/etc/selinux/config
  fi
fi
if command -v getenforce >/dev/null 2>&1 && [ "$(getenforce)" = "Enforcing" ]; then
  setenforce 0
fi
grubby --update-kernel=ALL --args="selinux=0"

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  log "installing Docker Engine and Compose v2"
  dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
  dnf -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
systemctl enable --now docker

if [ ! -f "$ENV_FILE" ]; then
  install -m 0600 "$SCRIPT_DIR/.env.example" "$ENV_FILE"
  log "created $ENV_FILE"
else
  chmod 0600 "$ENV_FILE"
  log "keeping existing $ENV_FILE"
fi

swap_kb="$(awk '/^SwapTotal:/ { print $2 }' /proc/meminfo)"
if [ "${swap_kb:-0}" -lt 8388608 ]; then
  log "warning: less than 8 GB swap is configured; full startup may exhaust memory"
fi

cat <<EOF

Environment installation completed.

1. Reboot once so SELinux is fully disabled:
     sudo reboot
2. Edit the deployment variables:
     sudo vi $ENV_FILE
3. After reboot, deploy all services:
     cd $SCRIPT_DIR
     sudo bash deploy.sh deploy
EOF
