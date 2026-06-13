<?php
/**
 * Plugin Name: Pod GraphQL Hardening
 * Description: Production hardening for the WPGraphQL endpoint (boilerplate §20/§21).
 *   When the site runs as 'production', this DISABLES public schema introspection and
 *   ENFORCES a max query depth. Dev/staging are left untouched so schema regen
 *   (`get-graphql-schema`) + GraphiQL keep working.
 *
 *   IMPORTANT: wp_get_environment_type() DEFAULTS to 'production' when WP_ENVIRONMENT_TYPE
 *   is unset — so a local dev WP MUST set WP_ENVIRONMENT_TYPE=local (docker-compose.yml
 *   does) or it will be hardened too and lose introspection.
 *
 *   Implemented by FILTERING the WPGraphQL setting reads (verified against WPGraphQL 2.16:
 *   DisableIntrospection + QueryDepth validation rules read these via
 *   `graphql_get_setting_section_field_value`). No stored-option mutation, so it is
 *   version-safe and overrides whatever is saved in wp-admin.
 *
 * @package PodTemplate
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter(
	'graphql_get_setting_section_field_value',
	/**
	 * @param mixed  $value       The stored/!default setting value.
	 * @param mixed  $default     The default value (unused).
	 * @param string $option_name The setting key being read.
	 * @return mixed
	 */
	static function ( $value, $default, $option_name ) {
		unset( $default );
		if ( 'production' !== wp_get_environment_type() ) {
			return $value;
		}
		switch ( $option_name ) {
			case 'public_introspection_enabled':
				return 'off'; // Never expose the schema to public requests in production.
			case 'query_depth_enabled':
				return 'on';  // Enforce a maximum query depth.
			case 'query_depth_max':
				// Honour a lower admin-set value; otherwise cap at 15 — comfortably above
				// the deepest real page query, so it blocks abuse without clipping content.
				$max = is_numeric( $value ) ? (int) $value : 0;
				return ( $max > 0 && $max <= 15 ) ? $max : 15;
		}
		return $value;
	},
	10,
	3
);
