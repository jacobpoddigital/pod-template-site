<?php
/**
 * Plugin Name: Pod Blocks — field groups as code
 * Description: Registers ACF field groups from pod-acf-export.json at load time.
 *              The JSON in the site repo is the single source of truth — no
 *              wp-admin import step, no UI-defined fields to drift. Editing
 *              fields in wp-admin will NOT persist; edit the JSON instead.
 *
 * Installed into wp-content/mu-plugins/ by wp/provision.sh together with a
 * copy of wp/acf-export.json (renamed pod-acf-export.json).
 */

add_action( 'acf/init', function () {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return; // ACF not active yet — nothing to register.
	}

	$json_path = __DIR__ . '/pod-acf-export.json';
	if ( ! file_exists( $json_path ) ) {
		error_log( 'pod-blocks-register: pod-acf-export.json missing' );
		return;
	}

	$groups = json_decode( (string) file_get_contents( $json_path ), true );
	if ( ! is_array( $groups ) ) {
		error_log( 'pod-blocks-register: invalid JSON in pod-acf-export.json' );
		return;
	}

	foreach ( $groups as $group ) {
		acf_add_local_field_group( $group );
	}
} );
