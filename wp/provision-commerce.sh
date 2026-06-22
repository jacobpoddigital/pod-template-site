#!/usr/bin/env bash
# Commerce module — WP-side provisioning (OPT-IN BOLT-ON; run AFTER wp/provision.sh).
# Installs WooCommerce + WooGraphQL and configures a headless store. Kept SEPARATE from the
# base provision.sh so brochure sites never carry commerce (mirrors the opt-in auth module).
# Idempotent. The DEMO catalogue (seed-commerce-demo.php) is generic placeholder data — a real
# client seeds/migrates their own products; delete or replace it per project.
#
#   Local:  WP_PORT=8084 WC_ZIP=/abs/path/woocommerce.zip \
#           WGQL_ZIP=/abs/path/wp-graphql-woocommerce.zip bash wp/provision-commerce.sh
#   CI:     WC_VERSION=<x.y.z> (wp.org) + WGQL_URL=<vendor> WGQL_TOKEN=<bearer> (private bucket)
#           — no licensed local zips needed; see docs/workflow/39 + the provision-wp action.
set -euo pipefail
cd "$(dirname "$0")/.."

WP_PORT="${WP_PORT:-8084}"
# WooCommerce IS on wp.org → CI installs by version; local supplies a pinned zip.
WC_ZIP="${WC_ZIP:-}"
WC_VERSION="${WC_VERSION:-}"
if [[ -z "$WC_ZIP" && -z "$WC_VERSION" ]]; then
  echo "ERROR: set WC_ZIP (local zip) or WC_VERSION (wp.org, e.g. 10.8.1)." >&2
  exit 1
fi
if [[ -n "$WC_ZIP" && ! -f "$WC_ZIP" ]]; then
  echo "ERROR: WC_ZIP set but file not found: $WC_ZIP" >&2
  exit 1
fi

wpcli() { docker compose run --rm --user root --entrypoint bash cli \
  -c "wp --allow-root --path=/var/www/html $*"; }

echo "==> Installing WooCommerce"
if ! wpcli "plugin is-installed woocommerce" 2>/dev/null; then
  if [[ -n "$WC_ZIP" ]]; then
    docker compose run --rm --user root --entrypoint bash \
      -v "$WC_ZIP:/tmp/woo.zip:ro" cli \
      -c "wp --allow-root --path=/var/www/html plugin install /tmp/woo.zip --activate"
  else
    wpcli "plugin install woocommerce --version=$WC_VERSION --activate"
  fi
else
  wpcli "plugin activate woocommerce"
fi

echo "==> Installing WooGraphQL (WPGraphQL WooCommerce)"
# NOT on wp.org — distributed via GitHub releases; supply the zip locally (like ACF/Woo) and
# re-wrap it into a wp-graphql-woocommerce/ folder (release zips are flat). v1.0.2 requires
# WPGraphQL >= 2.0.0, WC >= 9.0.0, PHP >= 8.1. Reads (products/categories) flow through this;
# cart/checkout WRITES use the Woo Store API + Cart-Token + Nonce (docs/commerce.md), not WooGraphQL.
WGQL_ZIP="${WGQL_ZIP:-}"
WGQL_URL="${WGQL_URL:-}"      # CI: token-gated vendor URL serving the FOLDER-WRAPPED zip
WGQL_TOKEN="${WGQL_TOKEN:-}"
if [[ -z "$WGQL_ZIP" && -z "$WGQL_URL" ]]; then
  echo "ERROR: set WGQL_ZIP (local) or WGQL_URL (+WGQL_TOKEN, private vendor bucket)." >&2
  exit 1
fi
# CI: fetch the folder-wrapped WooGraphQL zip from the vendor bucket (same pattern as ACF Pro).
if [[ -z "$WGQL_ZIP" ]]; then
  WGQL_ZIP="$(pwd)/wp/wp-graphql-woocommerce.zip"
  curl -fsSL ${WGQL_TOKEN:+-H "Authorization: Bearer $WGQL_TOKEN"} "$WGQL_URL" -o "$WGQL_ZIP"
  unzip -l "$WGQL_ZIP" >/dev/null   # fail fast if the fetch returned an error page, not a zip
elif [[ ! -f "$WGQL_ZIP" ]]; then
  echo "ERROR: WGQL_ZIP set but file not found: $WGQL_ZIP" >&2
  exit 1
fi
if ! wpcli "plugin is-installed wp-graphql-woocommerce" 2>/dev/null; then
  # mount with the canonical filename so wp-cli derives the slug 'wp-graphql-woocommerce'
  docker compose run --rm --user root --entrypoint bash \
    -v "$WGQL_ZIP:/tmp/wp-graphql-woocommerce.zip:ro" cli \
    -c "wp --allow-root --path=/var/www/html plugin install /tmp/wp-graphql-woocommerce.zip --activate"
else
  wpcli "plugin activate wp-graphql-woocommerce"
fi

echo "==> Store base config (UK / GBP; guest checkout). Adjust country/currency per client."
wpcli "option update woocommerce_default_country 'GB:GB-ENG'"
wpcli "option update woocommerce_currency 'GBP'"
wpcli "option update woocommerce_currency_pos 'left'"
wpcli "option update woocommerce_weight_unit 'g'"
wpcli "option update woocommerce_dimension_unit 'cm'"
wpcli "option update woocommerce_enable_guest_checkout 'yes'"
wpcli "option update woocommerce_enable_signup_and_login_from_checkout 'yes'"
wpcli "option update woocommerce_enable_checkout_login_reminder 'yes'"
wpcli "option update woocommerce_calc_taxes 'no'"
# Skip the setup wizard / marketing nags on a headless store
wpcli "option update woocommerce_onboarding_profile '{\"skipped\":true}' --format=json" 2>/dev/null || true
wpcli "option update woocommerce_task_list_hidden 'yes'" 2>/dev/null || true

# ---------------------------------------------------------------------------------------------
# DEMO catalogue — generic placeholder data so /shop + /product render in local dev. A real
# client REPLACES this with their own products (seed/migrate). Delete this block + the seed file
# for a clean store, or swap in a project-specific seed. SET SEED_COMMERCE=0 to skip it.
# ---------------------------------------------------------------------------------------------
if [[ "${SEED_COMMERCE:-1}" == "1" ]]; then
  echo "==> Seeding the GENERIC demo catalogue (placeholder — replace per client)"
  wpcli "eval-file /opt/pod-wp/seed-commerce-demo.php"
  echo "==> Flushing WooCommerce product caches (post-seed hygiene)"
  wpcli "eval \"if (function_exists('wc_delete_product_transients')) { wc_delete_product_transients(); }\""
  wpcli "cache flush"
else
  echo "==> SEED_COMMERCE=0 → skipping the demo catalogue"
fi

echo
echo "Done. WooCommerce + WooGraphQL installed, store configured (UK/GBP, guest checkout)."
echo "Next: set WPGRAPHQL_URL + siteConfig.commerce=true; enable checkout/account via their env gates."
