<?php
/**
 * Plugin Name: Pod Redirects Export — normalized read-only endpoint
 * Description: Exposes the site's 301/302 redirects as normalized JSON so the headless
 *              frontend can pull them at build/deploy (Next `redirects()` via WP_REDIRECTS_URL).
 *              GENERIC. Editors keep managing redirects in the familiar WP plugin UI; this just
 *              re-publishes them in one stable shape. Enforcement happens at the edge (Vercel).
 *
 * GET /wp-json/pod/v1/redirects  →  [ { "source": "/old", "destination": "/new", "permanent": true }, ... ]
 *
 * Reads the WebFactory "301 Redirects" plugin (slug eps-301-redirects) — Pod's usual plugin.
 * VERIFIED 2026-06-13 against the installed plugin: it stores rules in a CUSTOM TABLE
 * `{$wpdb->prefix}redirects` (cols: url_from, url_to, status), NOT an option. `status` holds
 * the HTTP code ('301'|'302'|'307') or 'inactive'/'404'. (An earlier version of this shim wrongly
 * read a `eps_redirects` option — that's the settings-framework slug, not the redirect data.)
 *
 * Different plugin? Swap the query below, or export to redirects.json at migration time.
 */

add_action( 'rest_api_init', function () {
	register_rest_route( 'pod/v1', '/redirects', [
		'methods'             => 'GET',
		'permission_callback' => '__return_true', // read-only, non-sensitive (public 301 map)
		'callback'            => function () {
			global $wpdb;
			$table = $wpdb->prefix . 'redirects';

			// Plugin not installed / table absent → no redirects (safe default).
			if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) !== $table ) {
				return [];
			}

			// Skip disabled ('inactive') and 404-log rows; keep real redirects.
			$rows = $wpdb->get_results(
				"SELECT url_from, url_to, status FROM `{$table}` WHERE status NOT IN ('inactive','404')",
				ARRAY_A
			);

			$out = [];
			foreach ( (array) $rows as $r ) {
				$source      = $r['url_from'] ?? null;
				$destination = $r['url_to'] ?? null;
				if ( ! $source || ! $destination ) {
					continue;
				}
				$status    = (string) ( $r['status'] ?? '301' );
				$permanent = $status === '301' || $status === '308';
				$out[]     = [
					'source'      => $source,
					'destination' => $destination,
					'permanent'   => $permanent,
				];
			}
			return $out;
		},
	] );
} );
