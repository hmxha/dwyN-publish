#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
ENV_FILE="${ENV_FILE:-$SCRIPT_DIR/.env}"
RUNTIME_DIR="$SCRIPT_DIR/.runtime"

CORE_SERVICES=(lobby admin robot)
GAME_SERVICES=(
  minigame
  smxw_1 smxw_2 smxw_3 smxw_4
  south_1 south_2 south_3 south_4
  caishen_1
  phom_1 phom_2 phom_3 phom_4
  samloc_1 samloc_2 samloc_3 samloc_4 samloc_5
)

log() {
  printf '[deploy] %s\n' "$*"
}

die() {
  printf '[deploy] ERROR: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "required command not found: $1"
}

load_env() {
  [ -f "$ENV_FILE" ] || die "missing $ENV_FILE; copy .env.example to .env first"
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a

  : "${APP_IMAGE:?APP_IMAGE is required in publish/.env}"
  : "${PUBLIC_HOST:?PUBLIC_HOST is required in publish/.env}"
  : "${MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD is required in publish/.env}"
  : "${REDIS_PASSWORD:?REDIS_PASSWORD is required in publish/.env}"
  : "${ALLOW_LEGACY_SEED:=0}"

  case "$APP_IMAGE" in
    *replace-me*|*replace-with-build-tag*|registry.example.com/*) die "replace the APP_IMAGE placeholder" ;;
  esac
  case "$MYSQL_ROOT_PASSWORD:$REDIS_PASSWORD" in
    *replace-with*) die "replace all password placeholders" ;;
  esac
  [ "$ALLOW_LEGACY_SEED" = "1" ] || die "review the legacy SQL dataset, then set ALLOW_LEGACY_SEED=1"

  case "$PUBLIC_HOST" in
    *[!A-Za-z0-9.-]*) die "PUBLIC_HOST must be an IPv4 address or DNS hostname" ;;
  esac
}

require_layout() {
  local path
  for path in \
    vietnam/bin/conf/config.toml \
    vietnam/bin/conf/smxw/timer.json \
    vietnam/bin/conf/smxw/fish.json \
    nginx/conf.d/vietnam-gateway.conf \
    mysql/initdb/init_game_vietnam.sql; do
    [ -e "$SCRIPT_DIR/$path" ] || die "publish resource is missing: $path"
  done
}

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

ensure_registry_access() {
  if docker manifest inspect "$APP_IMAGE" >/dev/null 2>&1; then
    return 0
  fi

  case "$APP_IMAGE" in
    ghcr.io/*)
      log "the GHCR image is private or the current Docker login cannot read it"
      read -r -p "GHCR username [${GHCR_USERNAME:-hmxha}]: " registry_username
      registry_username="${registry_username:-${GHCR_USERNAME:-hmxha}}"
      read -r -s -p "GHCR classic token (read:packages): " registry_token
      printf '\n'
      [ -n "$registry_token" ] || die "GHCR token cannot be empty"
      printf '%s' "$registry_token" | docker login ghcr.io -u "$registry_username" --password-stdin
      unset registry_token
      ;;
    *) die "cannot access image: $APP_IMAGE" ;;
  esac

  docker manifest inspect "$APP_IMAGE" >/dev/null 2>&1 || die "cannot access image after login: $APP_IMAGE"
}

set_env_value() {
  local key="$1"
  local value="$2"
  local temp_file
  temp_file="$(mktemp)"
  awk -v key="$key" -v value="$value" '
    BEGIN { found = 0 }
    $0 ~ "^" key "=" { print key "=" value; found = 1; next }
    { print }
    END { if (!found) print key "=" value }
  ' "$ENV_FILE" >"$temp_file"
  chmod --reference="$ENV_FILE" "$temp_file" 2>/dev/null || chmod 0600 "$temp_file"
  mv "$temp_file" "$ENV_FILE"
}

sanitize_config() {
  local file="$1"
  local temp_file
  temp_file="$(mktemp)"
  awk '
    /^\[[^]]+\]/ {
      section = $0
      gsub(/^\[|\]$/, "", section)
    }
    (section == "redis" || section == "database") && /^[[:space:]]*password[[:space:]]*=/ {
      print "password = \"overridden-by-environment\""
      next
    }
    section == "payment" && /^[[:space:]]*(secret|flyer_key|mid)[[:space:]]*=/ {
      split($0, parts, "=")
      key = parts[1]
      gsub(/[[:space:]]/, "", key)
      print key " = \"overridden-by-environment\""
      next
    }
    section == "xworld" && /^[[:space:]]*(secret_key|mch_id)[[:space:]]*=/ {
      split($0, parts, "=")
      key = parts[1]
      gsub(/[[:space:]]/, "", key)
      print key " = \"overridden-by-environment\""
      next
    }
    section == "dingding" && /^[[:space:]]*ding_token[[:space:]]*=/ {
      print "ding_token = \"overridden-by-environment\""
      next
    }
    section == "shushu" && /^[[:space:]]*app_id[[:space:]]*=/ {
      print "app_id = \"overridden-by-environment\""
      next
    }
    { print }
  ' "$file" >"$temp_file"
  mv "$temp_file" "$file"
}

prepare_runtime() {
  local sql_temp
  log "preparing runtime files"
  mkdir -p \
    "$RUNTIME_DIR/conf" \
    "$RUNTIME_DIR/conf/smxw/thinklog" \
    "$RUNTIME_DIR/conf/mg_bbs/thinklog" \
    "$RUNTIME_DIR/log" \
    "$RUNTIME_DIR/mysql-init" \
    "$RUNTIME_DIR/nginx/conf.d" \
    "$RUNTIME_DIR/nginx/log" \
    "$RUNTIME_DIR/nginx/www"

  cp -R "$SCRIPT_DIR/vietnam/bin/conf/." "$RUNTIME_DIR/conf/"

  while IFS= read -r -d '' config_file; do
    sanitize_config "$config_file"
    sed -i "s/13\.215\.49\.97/${PUBLIC_HOST}/g" "$config_file"
  done < <(find "$RUNTIME_DIR/conf" -type f -name 'config.toml' -print0)

  cp -R "$SCRIPT_DIR/nginx/conf.d/." "$RUNTIME_DIR/nginx/conf.d/"
  cp -R "$SCRIPT_DIR/nginx/www/." "$RUNTIME_DIR/nginx/www/"
  while IFS= read -r -d '' web_archive; do
    unzip -oq "$web_archive" -d "$RUNTIME_DIR/nginx/www"
  done < <(find "$SCRIPT_DIR/nginx/www" -maxdepth 1 -type f -name '*.zip' -print0)

  sql_temp="$(mktemp "$RUNTIME_DIR/mysql-init/00-game-vietnam.sql.XXXXXX")"
  {
    printf 'CREATE DATABASE IF NOT EXISTS game_vietnam CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;\n'
    printf 'USE game_vietnam;\n'
    sed "s/13\.215\.49\.97/${PUBLIC_HOST}/g" \
      "$SCRIPT_DIR/mysql/initdb/init_game_vietnam.sql"
  } >"$sql_temp"
  mv "$sql_temp" "$RUNTIME_DIR/mysql-init/00-game-vietnam.sql"
}

wait_for_health() {
  local service="$1"
  local timeout_seconds="${2:-300}"
  local deadline=$((SECONDS + timeout_seconds))
  local container_id status

  while [ "$SECONDS" -lt "$deadline" ]; do
    container_id="$(compose ps -q "$service")"
    if [ -n "$container_id" ]; then
      status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id")"
      if [ "$status" = "healthy" ] || [ "$status" = "running" ]; then
        log "$service is $status"
        return 0
      fi
      if [ "$status" = "unhealthy" ] || [ "$status" = "exited" ] || [ "$status" = "dead" ]; then
        compose logs --tail=100 "$service" >&2 || true
        die "$service entered state $status"
      fi
    fi
    sleep 5
  done
  compose logs --tail=100 "$service" >&2 || true
  die "timed out waiting for $service"
}

start_in_batches() {
  local batch_size=4
  local index=0
  local batch=()
  local service

  compose up -d "${CORE_SERVICES[@]}"
  for service in "${GAME_SERVICES[@]}"; do
    batch+=("$service")
    index=$((index + 1))
    if [ "$index" -eq "$batch_size" ]; then
      compose up -d "${batch[@]}"
      batch=()
      index=0
      sleep 5
    fi
  done
  if [ "${#batch[@]}" -gt 0 ]; then
    compose up -d "${batch[@]}"
  fi
}

smoke_test() {
  local attempt
  for attempt in $(seq 1 30); do
    if curl --fail --silent --show-error --max-time 5 http://127.0.0.1:6034/time >/dev/null; then
      log "HTTP smoke test passed"
      return 0
    fi
    sleep 2
  done
  compose logs --tail=100 lobby >&2 || true
  die "HTTP smoke test failed"
}

deploy_all() {
  local requested_image="${1:-}"
  if [ -n "$requested_image" ]; then
    case "$requested_image" in
      *[!A-Za-z0-9._/@:-]*|""|*:|*@) die "image must be a safe, fully qualified tagged reference" ;;
    esac
    set_env_value APP_IMAGE "$requested_image"
    export APP_IMAGE="$requested_image"
  fi

  prepare_runtime
  compose config --quiet
  ensure_registry_access
  compose pull

  log "starting infrastructure"
  compose up -d mysql redis nginx-gateway
  wait_for_health mysql 1800
  wait_for_health redis 180

  log "starting all application services in batches"
  start_in_batches
  compose up -d --remove-orphans
  for service in "${CORE_SERVICES[@]}" "${GAME_SERVICES[@]}"; do
    wait_for_health "$service" 180
  done
  smoke_test
  compose ps
  log "deployment completed: $APP_IMAGE"
}

usage() {
  cat <<'EOF'
Usage:
  ./deploy.sh prepare
  ./deploy.sh deploy [registry/image:tag]
  ./deploy.sh status
  ./deploy.sh logs [service]
  ./deploy.sh restart
  ./deploy.sh stop

The script never deletes Docker volumes. Database resets must be performed as a
separate, explicitly reviewed operation.
EOF
}

main() {
  local command="${1:-deploy}"
  shift || true

  case "$command" in
    help|-h|--help) usage; return 0 ;;
  esac

  require_command docker
  require_command awk
  require_command sed
  require_command curl
  require_command find
  require_command unzip
  docker compose version >/dev/null 2>&1 || die "Docker Compose v2 is required"
  require_layout
  load_env

  mkdir -p "$RUNTIME_DIR"
  exec 9>"$RUNTIME_DIR/deploy.lock"
  if command -v flock >/dev/null 2>&1; then
    flock -n 9 || die "another deployment is already running"
  fi

  case "$command" in
    prepare) prepare_runtime ;;
    deploy) deploy_all "${1:-}" ;;
    status) compose ps ;;
    logs) compose logs --tail=200 "${1:-lobby}" ;;
    restart) compose restart ;;
    stop) compose stop ;;
    *) usage; die "unknown command: $command" ;;
  esac
}

main "$@"
