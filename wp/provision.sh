#!/usr/bin/env bash
# One-command local WordPress provisioning (template-repo asset).
#
#   ACF_PRO_ZIP=~/path/advanced-custom-fields-pro.zip ./wp/provision.sh
#
# From-zero rebuild: docker compose down -v && ACF_PRO_ZIP=… ./wp/provision.sh
# Idempotent: safe to re-run on an existing stack.
#
# Steps: compose up → WP core install → ACF Pro install → field groups from
# code (mu-plugin + repo JSON) → seed `home` page content → pretty permalinks
# → REST smoke test. No wp-admin clicking anywhere.
set -euo pipefail
cd "$(dirname "$0")/.."

WP_URL="http://localhost:8081"
ACF_PRO_ZIP="${ACF_PRO_ZIP:-}"

if [[ -z "$ACF_PRO_ZIP" || ! -f "$ACF_PRO_ZIP" ]]; then
  echo "ERROR: set ACF_PRO_ZIP to the ACF Pro plugin zip (agency licence)." >&2
  exit 1
fi

wpcli() { docker compose run --rm -T cli wp "$@"; }

echo "==> Starting containers"
docker compose up -d

echo "==> Waiting for WordPress core files"
for i in $(seq 1 60); do
  docker compose run --rm -T cli test -f /var/www/html/wp-load.php 2>/dev/null && break
  sleep 2
  [[ $i == 60 ]] && { echo "WP core files never appeared" >&2; exit 1; }
done

echo "==> Installing WordPress (local-only admin credentials)"
if ! wpcli core is-installed 2>/dev/null; then
  wpcli core install \
    --url="$WP_URL" \
    --title="Website Navigator (local)" \
    --admin_user=admin \
    --admin_password=admin \
    --admin_email=dev@poddigital.co.uk \
    --skip-email
else
  echo "    already installed"
fi

echo "==> Installing ACF Pro"
if ! wpcli plugin is-installed advanced-custom-fields-pro 2>/dev/null; then
  docker compose run --rm -T -v "$ACF_PRO_ZIP:/tmp/acf-pro.zip:ro" cli \
    wp plugin install /tmp/acf-pro.zip --activate
else
  wpcli plugin activate advanced-custom-fields-pro
fi

echo "==> Registering field groups from code (mu-plugin + repo JSON)"
docker compose run --rm -T cli sh -c '
  mkdir -p /var/www/html/wp-content/mu-plugins &&
  cp /opt/pod-wp/mu-plugins/pod-blocks-register.php /var/www/html/wp-content/mu-plugins/ &&
  cp /opt/pod-wp/acf-export.json /var/www/html/wp-content/mu-plugins/pod-acf-export.json
'

echo "==> Seeding home page content"
wpcli eval-file /opt/pod-wp/provision-content.php

echo "==> Permalinks (REST needs pretty permalinks) + discourage indexing"
wpcli rewrite structure '/%postname%/'
wpcli rewrite flush --hard
wpcli option update blog_public 0 >/dev/null

echo "==> REST smoke test"
REST_JSON=$(curl -sf "$WP_URL/wp-json/wp/v2/pages?slug=home&acf_format=standard")
echo "$REST_JSON" | grep -q '"acf_fc_layout":"hero"' \
  && echo "    OK: home page exposes ACF blocks over REST" \
  || { echo "FAIL: REST response missing ACF blocks:"; echo "$REST_JSON" | head -c 600; exit 1; }

echo
echo "Done. WP admin: $WP_URL/wp-admin (admin/admin, local only)"
echo "Point the frontend at it:  WORDPRESS_API_URL=$WP_URL/wp-json"
