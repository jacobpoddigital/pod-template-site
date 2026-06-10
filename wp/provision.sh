#!/usr/bin/env bash
# One-command local WordPress provisioning.
# TEMPLATE: set SITE_TITLE, SITE_SLUG, and WP_PORT at the top before using.
#
#   ACF_PRO_ZIP=~/path/acf-pro.zip bash wp/provision.sh
#
# From-zero rebuild: docker compose down -v && ACF_PRO_ZIP=… bash wp/provision.sh
# Idempotent: safe to re-run on an existing stack.
# Must be run as root inside the cli container (provision.sh handles this via docker run).
set -euo pipefail
cd "$(dirname "$0")/.."

# TEMPLATE: fill these in per-client
SITE_TITLE="{{CLIENT_NAME}} (local)"
SITE_SLUG="{{SITE_SLUG}}"
WP_PORT="${WP_PORT:-8081}"
WP_URL="http://localhost:${WP_PORT}"
ACF_PRO_ZIP="${ACF_PRO_ZIP:-}"

if [[ -z "$ACF_PRO_ZIP" || ! -f "$ACF_PRO_ZIP" ]]; then
  echo "ERROR: set ACF_PRO_ZIP to the ACF Pro plugin zip (agency licence)." >&2
  exit 1
fi

echo "==> Starting containers"
docker compose up -d

echo "==> Waiting for database to be ready"
for i in $(seq 1 60); do
  docker compose run --rm --user root --entrypoint bash cli \
    -c "wp --allow-root --path=/var/www/html db query 'SELECT 1'" 2>/dev/null && break
  sleep 2
  [[ $i == 60 ]] && { echo "Database never became ready" >&2; exit 1; }
done

echo "==> Waiting for WordPress core files"
for i in $(seq 1 60); do
  docker compose run --rm --user root --entrypoint bash cli \
    -c "test -f /var/www/html/wp-load.php" 2>/dev/null && break
  sleep 2
  [[ $i == 60 ]] && { echo "WP core files never appeared" >&2; exit 1; }
done

wpcli() {
  docker compose run --rm --user root --entrypoint bash cli \
    -c "wp --allow-root --path=/var/www/html $*"
}

echo "==> Installing WordPress (local-only admin credentials)"
if ! wpcli "core is-installed" 2>/dev/null; then
  wpcli "core install \
    --url='$WP_URL' \
    --title='$SITE_TITLE' \
    --admin_user=admin \
    --admin_password=admin \
    --admin_email=jacob@poddigital.co.uk \
    --skip-email"
else
  echo "    already installed"
fi

echo "==> Installing ACF Pro"
if ! wpcli "plugin is-installed advanced-custom-fields-pro" 2>/dev/null; then
  docker compose run --rm --user root --entrypoint bash \
    -v "$ACF_PRO_ZIP:/tmp/acf-pro.zip:ro" cli \
    -c "wp --allow-root --path=/var/www/html plugin install /tmp/acf-pro.zip --activate"
else
  wpcli "plugin activate advanced-custom-fields-pro"
fi

echo "==> Installing WPGraphQL + WPGraphQL for ACF (sole content layer, ADR 0013)"
# wp.org slugs. wpgraphql-acf is the 2.x rewrite that exposes ACF field groups as
# typed GraphQL unions. Per layout: set "Show in GraphQL" + a pinned Type Name.
for gqlplugin in wp-graphql wpgraphql-acf; do
  if ! wpcli "plugin is-installed $gqlplugin" 2>/dev/null; then
    wpcli "plugin install $gqlplugin --activate"
  else
    wpcli "plugin activate $gqlplugin"
  fi
done

echo "==> Copying mu-plugin and ACF field groups from repo"
docker compose run --rm --user root --entrypoint bash cli -c "
  mkdir -p /var/www/html/wp-content/mu-plugins
  cp /opt/pod-wp/mu-plugins/pod-blocks-register.php /var/www/html/wp-content/mu-plugins/
  if ls /opt/pod-wp/acf-fields/*.json 1>/dev/null 2>&1; then
    mkdir -p /var/www/html/wp-content/acf-fields
    cp /opt/pod-wp/acf-fields/*.json /var/www/html/wp-content/acf-fields/
  fi
"

echo "==> Seeding initial content"
if [[ -f "wp/provision-content.php" ]]; then
  docker compose run --rm --user root --entrypoint bash cli \
    -c "wp --allow-root --path=/var/www/html eval-file /opt/pod-wp/provision-content.php"
fi

echo "==> Permalinks (WPGraphQL /graphql endpoint needs pretty permalinks)"
wpcli "rewrite structure '/%postname%/'"
wpcli "rewrite flush --hard"
wpcli "option update blog_public 0"

echo "==> REST smoke test"
REST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WP_URL/wp-json/wp/v2/pages")
if [[ "$REST_STATUS" == "200" ]]; then
  echo "    OK: REST API responding at $WP_URL/wp-json"
else
  echo "WARN: REST API returned HTTP $REST_STATUS — check WP permalink settings" >&2
fi

echo
echo "Done. WP admin: $WP_URL/wp-admin (admin/admin, local only)"
echo "Frontend env:   WORDPRESS_API_URL=$WP_URL/wp-json"
