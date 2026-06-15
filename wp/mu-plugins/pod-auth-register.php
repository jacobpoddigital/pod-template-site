<?php
/**
 * Plugin Name: Pod Auth — JWT secret + auth notes (opt-in)
 * Description: WordPress-side wiring for the headless AUTH SCAFFOLDING (docs/auth.md).
 *              The frontend talks to WP via WPGraphQL-JWT; this file documents + asserts
 *              the server requirements so a misconfigured site fails LOUD in admin instead
 *              of silently never issuing tokens.
 *
 * GO-LIVE GATE — VERIFIED 2026-06-15 against wp-graphql 2.16.0 + JWT plugin 0.7 (v0.7.2).
 * Per-site steps (docs/auth.md §Go-live):
 *   1. Install + activate **wp-graphql-jwt-authentication** from the GitHub RELEASE ZIP
 *      (`wp plugin install <release-zip-url> --activate`) or composer — it is NOT on wp.org.
 *      It adds the `login` + `refreshJwtAuthToken` mutations the frontend uses. The core
 *      mutations the reset flow uses (sendPasswordResetEmail / resetUserPassword) and
 *      `viewer` are already in WPGraphQL core (verified on 2.x, 2026-06-15).
 *   2. Define the signing secret in wp-config.php (NEVER commit it):
 *        define( 'GRAPHQL_JWT_AUTH_SECRET_KEY', '<long random string>' );
 *      On WP Engine / Atlas set it as an environment secret. Rotating it logs everyone out
 *      (the global revocation lever). Per-user kill switch: updateUser(revokeJwtUserSecret:true)
 *      — note it BANS the user until an admin un-revokes (the plugin has no clean per-session
 *      logout; the frontend handles logout revocation with a denylist — docs/auth.md).
 *   3. Verify the wiring: WPGRAPHQL_URL=<live>/graphql pnpm dlx tsx scripts/verify-auth-live.ts
 *      (needs a test member user) → must print 11× PASS.
 *
 * No self-registration: the `registerUser` core mutation exists but is NOT exposed by the
 * frontend (decision 2026-06-15). Users are provisioned in wp-admin. To allow self-signup
 * later, add the registration mutation + email verification + spam defence (docs/auth.md).
 */

// Fail loud in admin if the signing secret is missing once the JWT plugin is active —
// without it the login mutation returns null and the cause is invisible.
add_action( 'admin_notices', function () {
	$jwt_active = class_exists( '\\WPGraphQL\\JWT_Authentication\\Auth' )
		|| function_exists( 'graphql_jwt_auth_secret_key' );
	if ( $jwt_active && ! defined( 'GRAPHQL_JWT_AUTH_SECRET_KEY' ) ) {
		echo '<div class="notice notice-error"><p><strong>Pod Auth:</strong> '
			. 'wp-graphql-jwt-authentication is active but <code>GRAPHQL_JWT_AUTH_SECRET_KEY</code> '
			. 'is not defined in wp-config.php — login tokens will not be issued.</p></div>';
	}
} );
