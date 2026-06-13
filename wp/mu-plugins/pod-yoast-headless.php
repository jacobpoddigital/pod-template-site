<?php
/**
 * Plugin Name: Pod Yoast — headless adjustments
 * Description: Makes Yoast SEO (free) behave in a headless setup. GENERIC — identical for
 *              every Pod site. Requires Yoast + "Add WPGraphQL SEO" (installed by provision.sh).
 *
 * Canonical / OG / JSON-LD URLs:
 *   We do NOT filter these per-piece. Instead the WordPress "Site Address (home) URL" is set
 *   to the FRONTEND origin (provision.sh: `wp option update home <frontend>`), while the
 *   "WordPress Address (siteurl)" stays the WP backend. Yoast + WP core then build canonical,
 *   opengraph and schema @id URLs from home_url() = the frontend, automatically — the standard
 *   headless WP pattern, version-proof, no string-replace hacks. The Next frontend ALSO sets
 *   canonical from the route path (belt and braces). See docs/seo.md §Yoast headless.
 *
 * This file only disables Yoast's own XML sitemap: the frontend owns /sitemap.xml
 * (src/app/sitemap.ts), and a second sitemap on the WP origin pointing at WP URLs would
 * confuse crawlers.
 */

add_filter( 'wpseo_enable_xml_sitemap', '__return_false' );
