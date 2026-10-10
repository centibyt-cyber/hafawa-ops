#!/usr/bin/env bash
# Usage: sudo bash deploy-update.sh [existing-web-root]
# Deploys prebuilt v25 assets. Leaves nginx, TLS, Supabase and user data unchanged.
set -Eeuo pipefail
PACKAGE_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
WEB="${1:-/var/www/hafawa-ops}"
WEB="${WEB%/}"
if [[ $EUID -ne 0 ]]; then echo 'Run with sudo.'; exit 1; fi
for command in python3 nginx sha256sum tar install flock; do
  command -v "$command" >/dev/null || { echo "Missing command: $command"; exit 1; }
done
[[ -f "$WEB/index.html" ]] || { echo "STOP: no existing Hafawa index at $WEB"; exit 1; }
[[ -d "$PACKAGE_DIR/dist" && -f "$PACKAGE_DIR/dist/SHA256SUMS" ]] || { echo 'STOP: incomplete update package'; exit 1; }
exec 9>/run/lock/hafawa-update.lock
flock -n 9 || { echo 'STOP: another update is running'; exit 1; }
nginx -t
CONFIG=$(mktemp)
trap 'rm -f "$CONFIG"' EXIT
nginx -T > "$CONFIG" 2>/dev/null
python3 - "$CONFIG" "$WEB" <<'PY'
import pathlib, re, sys
roots = re.findall(r'(?m)^\s*root\s+["\x27]?([^;"\x27]+)["\x27]?\s*;', pathlib.Path(sys.argv[1]).read_text())
target = pathlib.Path(sys.argv[2]).resolve()
if not any(pathlib.Path(root.strip()).resolve() == target for root in roots):
    raise SystemExit('STOP: web root does not match the active nginx configuration.')
if 'rcilynwwfgopfokkxdlf.supabase.co' not in (target / 'index.html').read_text():
    raise SystemExit('STOP: this directory is not the expected Hafawa project.')
PY
(cd "$PACKAGE_DIR/dist" && sha256sum --quiet -c SHA256SUMS)
mkdir -p /var/backups/hafawa
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP="/var/backups/hafawa/before-v25-$STAMP-$$.tar.gz"
tar -czf "$BACKUP" -C "$WEB" .
tar -tzf "$BACKUP" >/dev/null
RELEASE="releases/v25-$STAMP-$$"
install -d -m 755 "$WEB/releases" "$WEB/$RELEASE"
cp -R "$PACKAGE_DIR/dist/." "$WEB/$RELEASE/"
find "$WEB/$RELEASE" -type d -exec chmod 755 {} +
find "$WEB/$RELEASE" -type f -exec chmod 644 {} +
(cd "$WEB/$RELEASE" && sha256sum --quiet -c SHA256SUMS)

# Prepare the new entry point before the atomic switch. The export bundle is
# resolved relative to the app script and therefore stays inside this release.
python3 - "$WEB" "$RELEASE" <<'PY'
import pathlib, sys
web, release = pathlib.Path(sys.argv[1]), sys.argv[2]
source = (web / release / 'index.html').read_text()
for asset in ('app.js', 'app.css'):
    source = source.replace('"' + asset + '?', '"' + release + '/' + asset + '?')
if 'data-hf-app' not in source or 'VERSION:"v25-' not in source:
    raise SystemExit('STOP: unexpected build/version.')
(web / 'index.hafawa-new.html').write_text(source)
PY
chmod 644 "$WEB/index.hafawa-new.html"
if [[ ! -f "$WEB/manifest.webmanifest" ]]; then install -m 644 "$PACKAGE_DIR/dist/manifest.webmanifest" "$WEB/manifest.webmanifest"; fi
mv -f "$WEB/index.hafawa-new.html" "$WEB/index.html"
echo 'Hafawa v25 installed. Refresh the site and open Employee tracking.'
echo "Backup: $BACKUP"
echo 'Rollback command:'
printf 'sudo tar -xzf %q -C %q ./index.html\n' "$BACKUP" "$WEB"
