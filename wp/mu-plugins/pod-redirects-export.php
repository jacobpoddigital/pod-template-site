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
 * Reads the WebFactory "301 Redirects" plugin (slug eps-301-redirects) option `eps_redirects`
 * by default — Pod's usual plugin. Other plugins: adapt $rows below (or export to redirects.json).
 *
 * ⚠️ Confirm the option's exact sub-keys against your installed version (introspect with
 *    `wp option get eps_redirects --format=json`): historically url/from = source,
 *    redirect/to = destination, redirect_type ('301'/'302') = permanent, status = enable/disable.
 */

add_action( 'rest_api_init', function () {
	register_rest_route( 'pod/v1', '/redirects', [
		'methods'             => 'GET',
		'permission_callback' => '__return_true', // read-only, non-sensitive (public 301 map)
		'callback'            => function () {
			$raw = get_option( 'eps_redirects', [] );
			$rows = is_array( $raw ) ? $raw : [];
			$out  = [];
			foreach ( $rows as $r ) {
				if ( ! is_array( $r ) ) {
					continue;
				}
				// Skip disabled rules if the plugin records a status.
				$status = $r['status'] ?? 'enable';
				if ( $status === 'disable' || $status === '0' ) {
					continue;
				}
				$source      = $r['url']      ?? $r['from'] ?? $r['source']      ?? null;
				$destination = $r['redirect'] ?? $r['to']   ?? $r['destination'] ?? null;
				if ( ! $source || ! $destination ) {
					continue;
				}
				$type      = (string) ( $r['redirect_type'] ?? $r['type'] ?? '301' );
				$permanent = $type !== '302' && $type !== '307';
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
