<?php
/**
 * Plugin Name: Pod Blocks — field groups as code
 * Description: Registers ACF field groups from JSON files in wp-content/acf-fields/.
 *              The JSON files are the single source of truth — never edit fields in
 *              wp-admin (changes won't persist). Edit the JSON + matching zod schema,
 *              then re-run wp/provision.sh to sync local WordPress.
 *
 * ACF isolation rule: wp/acf-fields/ must contain ONLY this site's field group JSON.
 * Never copy a field group from another site — duplicate field NAMES on the same
 * post_type cause ACF to render the wrong group. All keys must be site-prefixed:
 * group_<siteslug>_* and field_<siteslug>_*.
 */

add_action( 'acf/init', function () {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return; // ACF not active yet — nothing to register.
	}

	$dir = WP_CONTENT_DIR . '/acf-fields';
	if ( is_dir( $dir ) ) {
		foreach ( glob( $dir . '/*.json' ) as $file ) {
			$group = json_decode( (string) file_get_contents( $file ), true );
			if ( is_array( $group ) && ! empty( $group['key'] ) ) {
				acf_add_local_field_group( $group );
			}
		}
	}

	// The page-blocks group (the `pageFields` flexible-content field) is GENERATED from the
	// frontend block contract by scripts/generate-acf-blocks.mjs and copied here at provision
	// time (workflow/29 — "per-client ACF generated at provision time"). It's an ARRAY of
	// field groups (ACF export format), not a single group, so it's loaded separately.
	$export = WP_CONTENT_DIR . '/acf-export.json';
	if ( file_exists( $export ) ) {
		$groups = json_decode( (string) file_get_contents( $export ), true );
		foreach ( (array) $groups as $group ) {
			if ( is_array( $group ) && ! empty( $group['key'] ) ) {
				acf_add_local_field_group( $group );
			}
		}
	}
} );

/**
 * Custom REST endpoint: GET/PUT /wp-json/pod/v1/pages/:slug/blocks
 *
 * Uses update_field() with the field KEY (not name) to avoid ambiguity when
 * multiple field groups exist on the same post type.
 *
 * IMPORTANT: Replace 'field_stride_flexible_content' with this site's
 * actual field key from wp/acf-fields/<siteslug>-page-blocks.json.
 *
 * Do NOT use the standard WP REST write path (POST /wp/v2/pages/:id) — it
 * silently drops repeater sub-fields inside flexible content layouts.
 * The set_page_sections / append_page_section / patch_page_section MCP tools
 * already use this endpoint — don't bypass them.
 */
add_action( 'rest_api_init', function () {
	register_rest_route( 'pod/v1', '/pages/(?P<slug>[a-z0-9-]+)/blocks', [
		'methods'             => [ 'GET', 'PUT' ],
		'callback'            => function ( WP_REST_Request $req ) {
			$slug  = sanitize_title( $req->get_param( 'slug' ) );
			$pages = get_posts( [ 'name' => $slug, 'post_type' => 'page', 'posts_per_page' => 1 ] );
			if ( empty( $pages ) ) {
				return new WP_Error( 'not_found', 'Page not found', [ 'status' => 404 ] );
			}
			$id = $pages[0]->ID;

			// Replace with the actual field key from this site's acf-fields JSON.
			$field_key = 'field_stride_flexible_content';

			if ( $req->get_method() === 'PUT' ) {
				$body   = $req->get_json_params();
				$blocks = $body['blocks'] ?? [];
				update_field( $field_key, $blocks, $id );
				return [ 'updated' => true, 'blocks' => get_field( $field_key, $id ) ?: [] ];
			}

			return [ 'blocks' => get_field( $field_key, $id ) ?: [] ];
		},
		'permission_callback' => '__return_true',
	] );
} );
