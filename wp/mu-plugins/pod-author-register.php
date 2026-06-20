<?php
/**
 * Plugin Name: Pod Author E-E-A-T — User profile fields (GraphQL)
 * Description: Hand-registers the author E-E-A-T fields on the WPGraphQL `User` type that
 *              the frontend's AuthorBySlug query reads FLAT (roleTitle / teamProfileUrl /
 *              profileImage / social / knowsAbout). Matches src/lib/cms/schema.graphql.
 *
 * Why hand-registered (not wpgraphql-acf auto-exposure): wpgraphql-acf nests an ACF field
 * group under a sub-field on the type, not the flat `user { roleTitle … }` the committed
 * schema + query declare. Explicit registration is deterministic + version-proof (same
 * stance as pod-chrome-register.php's siteOptions and pod-category-image-register.php).
 *
 * Editor UI for these fields lives in wp/acf-fields/*-author.json (location = User form);
 * field NAMES (role_title, team_profile_url, profile_image, social[label,url], knows_about
 * [topic]) are the resolver contract. GENERIC — identical for every Pod site with a blog.
 */

add_action( 'graphql_register_types', function () {
	register_graphql_object_type( 'UserSocial', [
		'description' => 'An author social link (label + URL).',
		'fields'      => [
			'label' => [ 'type' => 'String' ],
			'url'   => [ 'type' => 'String' ],
		],
	] );

	$user_id = function ( $source ) {
		return $source->databaseId ?? ( $source->userId ?? null );
	};

	register_graphql_field( 'User', 'roleTitle', [
		'type'    => 'String',
		'resolve' => function ( $source ) use ( $user_id ) {
			$id = $user_id( $source );
			return $id ? ( get_field( 'role_title', 'user_' . (int) $id ) ?: null ) : null;
		},
	] );

	register_graphql_field( 'User', 'teamProfileUrl', [
		'type'    => 'String',
		'resolve' => function ( $source ) use ( $user_id ) {
			$id = $user_id( $source );
			return $id ? ( get_field( 'team_profile_url', 'user_' . (int) $id ) ?: null ) : null;
		},
	] );

	register_graphql_field( 'User', 'profileImage', [
		'type'    => 'MediaItem',
		'resolve' => function ( $source, $args, $context ) use ( $user_id ) {
			$id  = $user_id( $source );
			$att = $id ? get_field( 'profile_image', 'user_' . (int) $id ) : null; // return_format: id
			return $att ? $context->get_loader( 'post' )->load_deferred( (int) $att ) : null;
		},
	] );

	register_graphql_field( 'User', 'social', [
		'type'    => [ 'list_of' => 'UserSocial' ],
		'resolve' => function ( $source ) use ( $user_id ) {
			$id   = $user_id( $source );
			$rows = $id ? ( get_field( 'social', 'user_' . (int) $id ) ?: [] ) : [];
			return array_map( function ( $r ) {
				return [ 'label' => $r['label'] ?? null, 'url' => $r['url'] ?? null ];
			}, $rows );
		},
	] );

	register_graphql_field( 'User', 'knowsAbout', [
		'type'    => [ 'list_of' => 'String' ],
		'resolve' => function ( $source ) use ( $user_id ) {
			$id   = $user_id( $source );
			$rows = $id ? ( get_field( 'knows_about', 'user_' . (int) $id ) ?: [] ) : [];
			return array_values( array_filter( array_map( function ( $r ) {
				return $r['topic'] ?? null;
			}, $rows ) ) );
		},
	] );
} );
