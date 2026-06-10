#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/openclaw/RelancesArchitecte}"
DB_PATH="${DB_PATH:-$APP_DIR/dev.db}"
BACKUP_DIR="${BACKUP_DIR:-$APP_DIR/backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

mkdir -p "$BACKUP_DIR"

if [[ ! -f "$DB_PATH" ]]; then
  echo "Database not found: $DB_PATH" >&2
  exit 1
fi

sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/dev-$STAMP.db'"
find "$BACKUP_DIR" -name "dev-*.db" -mtime +14 -delete
echo "$BACKUP_DIR/dev-$STAMP.db"
