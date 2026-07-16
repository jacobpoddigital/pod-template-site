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
 * The field key below ('field_pod_blocks') is NOT a per-site placeholder —
 * scripts/generate-acf-blocks.mjs hardcodes this exact key when it (re)writes
 * wp/acf-export.json on every provision, so it's the same on every client site.
 * A previous version of this file said "replace with this site's actual key",
 * which caused a real incident (2026-07-16): 5 fresh client sites were cloned
 * with a stale key ('field_stride_flexible_content') left over from Stride Hub.
 * Every set_page_sections write "succeeded" (the endpoint's own GET-after-PUT
 * echoed the in-request value) while silently updating a phantom field that
 * WPGraphQL/the frontend never read — content looked seeded but never was.
 * If you ever rename the generated field key in generate-acf-blocks.mjs,
 * update it here too (there is no other coupling between the two files).
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

			// Must match the key generate-acf-blocks.mjs writes into acf-export.json — see
			// the class docblock above for why this is a fixed constant, not a per-site value.
			$field_key = 'field_pod_blocks';

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
