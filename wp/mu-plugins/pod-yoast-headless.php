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
 * XML sitemap: the frontend owns /sitemap.xml (src/app/sitemap.ts). A second sitemap on the WP
 * origin pointing at WP URLs would confuse crawlers, so we suppress Yoast's. NOTE: the
 * `wpseo_enable_xml_sitemap` filter is NO LONGER sufficient on its own (verified false on Yoast
 * 27.8 yet the route still served), so we ALSO 404 the sitemap URLs deterministically — version-proof.
 */

add_filter( 'wpseo_enable_xml_sitemap', '__return_false' );

// Deterministic kill-switch: 404 any *sitemap*.xml / .xsl request on the WP origin, before Yoast
// (or core) can render one. Runs early on parse_request so it beats Yoast's own handler.
add_action( 'parse_request', function ( $wp ) {
	$uri = isset( $_SERVER['REQUEST_URI'] ) ? (string) $_SERVER['REQUEST_URI'] : '';
	if ( preg_match( '#sitemap[^/]*\.(xml|xsl)$#i', $uri ) ) {
		status_header( 404 );
		nocache_headers();
		exit;
	}
}, 0 );
