#!/usr/bin/env bash
# One-command local WordPress provisioning.
# TEMPLATE: set SITE_TITLE, SITE_SLUG, and WP_PORT at the top before using.
#
#   ACF_PRO_ZIP=~/path/acf-pro.zip bash wp/provision.sh
#
# From-zero rebuild: docker compose down -v && ACF_PRO_ZIP=… bash wp/provision.sh
# Idempotent: safe to re-run on an existing stack.
# Stale-volume gotcha (earned 2026-06-12): a half-initialised db_data volume corrupts
# MariaDB (e.g. "ib_logfile0 not found"). If the DB never becomes ready below, the fix is
# `docker compose down -v --remove-orphans` then re-run — NOT deleting individual files.
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

echo "==> Installing WPGraphQL Offset Pagination (path-based /blog/page/N — the standard blog, workflow/33)"
# Adds `where.offsetPagination { offset size }` + `pageInfo.offsetPagination.total`, which
# the blog cms layer (getBlogPosts) needs for SEO-clean numbered pagination. Not always on
# wp.org under this slug; if the install fails, add valu-digital's release manually (non-fatal).
if ! wpcli "plugin is-installed wp-graphql-offset-pagination" 2>/dev/null; then
  wpcli "plugin install wp-graphql-offset-pagination --activate" \
    || echo "    !! Install manually: https://github.com/valu-digital/wp-graphql-offset-pagination (composer or release zip), then 'wp plugin activate wp-graphql-offset-pagination'."
else
  wpcli "plugin activate wp-graphql-offset-pagination"
fi
# Blog category banner image (Great White port): register an ACF image field `categoryImage`
# on the Category taxonomy with "Show in GraphQL" ON + GraphQL Field Name `categoryImage`, then
# `pnpm dlx get-graphql-schema "$WPGRAPHQL_URL" > src/lib/cms/schema.graphql` + `pnpm codegen`.
# Fields-as-code is per-project (ACF UI or a field group export) — see docs/blog.md.
echo "==> NOTE: register the ACF 'categoryImage' field on the Category taxonomy (Show in GraphQL) — see docs/blog.md"

echo "==> Installing Yoast SEO (free) + Add WPGraphQL SEO (per-page meta/OG/JSON-LD, boilerplate §6)"
# wp.org slugs. Yoast = the SEO source of truth (agency default, 2026-06-13); add-wpgraphql-seo
# exposes Yoast's `seo` field on Page/Post to WPGraphQL (free; the page-by-slug query reads it).
# Free Yoast has no redirect manager — redirects live in Next (redirects.json / WP_REDIRECTS_URL).
for seoplugin in wordpress-seo add-wpgraphql-seo; do
  if ! wpcli "plugin is-installed $seoplugin" 2>/dev/null; then
    wpcli "plugin install $seoplugin --activate"
  else
    wpcli "plugin activate $seoplugin"
  fi
done

# Headless URL pattern: set the WordPress "Site Address (home)" to the FRONTEND origin so
# Yoast/WP build canonical + OG + schema URLs against the frontend (see pod-yoast-headless.php).
# WordPress Address (siteurl) stays the WP backend so /wp-admin + /graphql keep working.
if [[ -n "${FRONTEND_URL:-}" ]]; then
  echo "==> Pointing WP 'home' at the frontend ($FRONTEND_URL) for headless canonical/OG/schema"
  wpcli "option update home '$FRONTEND_URL'"
fi

echo "==> Copying mu-plugins and ACF field groups from repo"
# Copy ALL mu-plugins (*.php), not a named one — pod-chrome-register.php (menus +
# siteOptions GraphQL) ships alongside pod-blocks-register.php and is required for the
# header/footer chrome the frontend's getSiteChrome query reads. (Earned 2026-06-12:
# the chrome plugin existed in the build repo but provision only copied the blocks plugin,
# so live WP 500'd on the siteOptions query while mock mode passed.)
docker compose run --rm --user root --entrypoint bash cli -c "
  mkdir -p /var/www/html/wp-content/mu-plugins
  cp /opt/pod-wp/mu-plugins/*.php /var/www/html/wp-content/mu-plugins/
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

echo "==> WPGraphQL smoke test"
GQL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$WP_URL/graphql" \
  -H 'Content-Type: application/json' --data '{"query":"{__typename}"}')
if [[ "$GQL_STATUS" == "200" ]]; then
  echo "    OK: WPGraphQL responding at $WP_URL/graphql"
else
  echo "WARN: WPGraphQL returned HTTP $GQL_STATUS — check the WPGraphQL plugin + pretty permalinks" >&2
fi

echo
echo "Done. WP admin: $WP_URL/wp-admin (admin/admin, local only)"
echo "Frontend env:   WPGRAPHQL_URL=$WP_URL/graphql   # the app reads this; WORDPRESS_API_URL (REST) is unused"
