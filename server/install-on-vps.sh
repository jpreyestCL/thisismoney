#!/usr/bin/env bash
set -euo pipefail
trap 'code=$?; echo "::error::Instalación del ranking falló en línea $LINENO (código $code): $BASH_COMMAND"; exit $code' ERR

WEBROOT=/var/www/tim.strivexlatam.com
SERVICE=thisismoney-leaderboard
APP_USER=timleaderboard

sudo -n true
if ! id "$APP_USER" >/dev/null 2>&1; then sudo useradd --system --home /nonexistent --shell /usr/sbin/nologin "$APP_USER"; fi
if ! sudo -u postgres psql -tAc "select 1 from pg_roles where rolname='$APP_USER'" | grep -q 1; then sudo -u postgres createuser "$APP_USER"; fi
if ! sudo -u postgres psql -tAc "select 1 from pg_database where datname='thisismoney'" | grep -q 1; then sudo -u postgres createdb --owner="$APP_USER" thisismoney; fi
sudo -u "$APP_USER" psql -v ON_ERROR_STOP=1 -d thisismoney -f "$WEBROOT/server/schema.sql"

cd "$WEBROOT/server"
npm install --prefix "$WEBROOT/server" --omit=dev --ignore-scripts --no-package-lock
MODULE_DIR=$(npm root --prefix "$WEBROOT/server")
test -d "$MODULE_DIR/pg"
sudo chmod -R a+rX "$MODULE_DIR" package.json leaderboard.mjs
sudo install -m 0644 thisismoney-leaderboard.service "/etc/systemd/system/$SERVICE.service"
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE"
sudo systemctl stop "$SERVICE" || true
sudo pkill -f '/var/www/tim.strivexlatam.com/server/leaderboard.mjs' || true
PORT_PIDS=$(sudo ss -ltnp 'sport = :8787' | sed -n 's/.*pid=\([0-9][0-9]*\).*/\1/p' | sort -u)
for pid in $PORT_PIDS; do sudo kill "$pid" || true; done
sleep 1
PORT_PIDS=$(sudo ss -ltnp 'sport = :8787' | sed -n 's/.*pid=\([0-9][0-9]*\).*/\1/p' | sort -u)
for pid in $PORT_PIDS; do sudo kill -9 "$pid" || true; done
sudo systemctl restart "$SERVICE"

sudo install -m 0644 nginx-location.conf /etc/nginx/snippets/tim-leaderboard.conf
SITE_LINK=$(grep -RslE 'root[[:space:]]+/var/www/tim\.strivexlatam\.com' /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null | head -n 1)
if [ -z "$SITE_LINK" ]; then echo 'No se encontró el sitio nginx de This is Money' >&2; exit 1; fi
SITE_FILE=$(readlink -f "$SITE_LINK")
if ! grep -q 'tim-leaderboard.conf' "$SITE_FILE"; then
  sudo cp "$SITE_FILE" "$SITE_FILE.before-leaderboard"
  sudo python3 - "$SITE_FILE" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
lines = path.read_text().splitlines(keepends=True)
root_line = next(i for i, line in enumerate(lines) if '/var/www/tim.strivexlatam.com' in line and 'root' in line)
depth = 0
server_depth = None
for i, line in enumerate(lines):
    depth += line.count('{') - line.count('}')
    if i == root_line:
        server_depth = depth
        break
if server_depth is None:
    raise SystemExit('No se pudo ubicar el bloque server')
for i in range(root_line + 1, len(lines)):
    next_depth = depth + lines[i].count('{') - lines[i].count('}')
    if next_depth < server_depth:
        lines.insert(i, '    include /etc/nginx/snippets/tim-leaderboard.conf;\n')
        path.write_text(''.join(lines))
        break
    depth = next_depth
else:
    raise SystemExit('No se encontró el cierre del bloque server')
PY
fi

sudo nginx -t
sudo systemctl reload nginx
for attempt in 1 2 3 4 5; do
  if curl -fsS http://127.0.0.1:8787/health; then exit 0; fi
  sleep 1
done
sudo systemctl --no-pager --full status "$SERVICE" || true
sudo journalctl -u "$SERVICE" -n 30 --no-pager || true
sudo journalctl -u "$SERVICE" -n 12 --no-pager | while IFS= read -r line; do echo "::error::$line"; done
echo '::error::La API del ranking no pudo conectarse a PostgreSQL o iniciar en el puerto 8787'
exit 1
