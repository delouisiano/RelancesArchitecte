#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

load_secret_file() {
  local name="$1"
  local file_var="${name}_FILE"
  local file_path="${!file_var:-}"

  if [ -z "${!name:-}" ] && [ -n "$file_path" ]; then
    if [ ! -r "$file_path" ]; then
      echo "Secret file not readable: $file_path" >&2
      exit 1
    fi

    export "$name=$(tr -d rn < "$file_path")"
  fi
}

load_secret_file AUTH_PASSWORD_HASH
load_secret_file AUTH_SECRET
load_secret_file ACTION_SECRET
load_secret_file SMTP_PASSWORD

exec "$@"
