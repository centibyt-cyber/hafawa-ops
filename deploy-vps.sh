#!/usr/bin/env bash
# نشر / تحديث نظام لاونج حفاوة على سيرفر Ubuntu
# الاستخدام:  bash deploy-vps.sh srv1711212.hstgr.cloud
set -euo pipefail
DOMAIN="${1:-}"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/dist"
WEB_ROOT="/var/www/hafawa-ops"
if [ -z "$DOMAIN" ]; then echo "الاستخدام: bash deploy-vps.sh your-domain.com"; exit 1; fi
if [ ! -d "$SRC_DIR" ]; then echo "لم أجد مجلد dist بجانب هذا السكربت."; exit 1; fi
echo "==> تثبيت nginx"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx
echo "==> نشر الملفات في $WEB_ROOT"
mkdir -p "$WEB_ROOT"
if [ -f "$WEB_ROOT/index.html" ]; then
  echo "==> نسخة احتياطية من النسخة الحالية في ${WEB_ROOT}_backup_prev"
  rm -rf "${WEB_ROOT}_backup_prev"; cp -r "$WEB_ROOT" "${WEB_ROOT}_backup_prev"
fi
rm -f "$WEB_ROOT"/app.js "$WEB_ROOT"/app.css
cp -r "$SRC_DIR"/. "$WEB_ROOT"/
chown -R www-data:www-data "$WEB_ROOT"
echo "==> إعداد nginx للدومين $DOMAIN"
cat > /etc/nginx/sites-available/hafawa-ops <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    root $WEB_ROOT;
    index index.html;
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;
    location = /index.html { add_header Cache-Control "no-cache"; }
    location ~* \.(js|css|webmanifest)$ { add_header Cache-Control "public, max-age=604800"; }
    location / { try_files \$uri \$uri/ /index.html; }
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header Referrer-Policy strict-origin-when-cross-origin;
}
NGINX
ln -sf /etc/nginx/sites-available/hafawa-ops /etc/nginx/sites-enabled/hafawa-ops
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
if command -v ufw >/dev/null 2>&1; then ufw allow 'Nginx Full' || true; fi
echo "==> إصدار شهادة SSL"
apt-get install -y -qq certbot python3-certbot-nginx
if certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect; then
  echo "تم إصدار الشهادة بنجاح."
else
  echo "تعذّر إصدار الشهادة — أعد: certbot --nginx -d $DOMAIN"
fi
echo
echo "=========================================="
echo " النظام يعمل الآن على: https://$DOMAIN"
echo "=========================================="
