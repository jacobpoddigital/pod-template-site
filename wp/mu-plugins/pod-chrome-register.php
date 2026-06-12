<?php
/**
 * Plugin Name: Pod Chrome — menu locations + Site Options (GraphQL)
 * Description: The editor-managed header/footer chrome the frontend's `getSiteChrome`
 *              query reads. Registers PRIMARY/FOOTER nav menu locations + a "Site Options"
 *              ACF options page (editor UI), and HAND-REGISTERS the GraphQL surface so it
 *              matches the committed schema EXACTLY (RootQuery.siteOptions → flat fields).
 *
 * Why hand-registered (not wpgraphql-acf auto-exposure): auto-exposing an ACF options
 * page in wpgraphql-acf 2.6.x nests the field group under a self-referential `siteOptions`
 * sub-field (SiteOptions.siteOptions: SiteOptions) — it can't produce the flat
 * `siteOptions { strapline ... }` contract. Explicit registration is deterministic and
 * matches src/lib/cms/schema.graphql. (Earned: Website Navigator build, 2026-06-12.)
 *
 * GENERIC — identical for every Pod site. Field NAMES below are the contract the resolver
 * reads (strapline, header_cta_label, …); the matching ACF field group lives in
 * wp/acf-fields/*-site-options.json (keys site-prefixed, names fixed). Do not rename
 * fields here without updating the field group + the frontend getSiteChrome query.
 */

// 1) Nav menu locations → WPGraphQL exposes them in MenuLocationEnum (upper-cased slug).
add_action( 'after_setup_theme', function () {
	register_nav_menus( [
		'primary' => 'Primary (header)',
		'footer'  => 'Footer',
	] );
} );

// 2) "Site Options" ACF options page — editor UI only (GraphQL is hand-registered below,
//    so NO show_in_graphql here; the field group JSON supplies the editable fields).
add_action( 'acf/init', function () {
	if ( function_exists( 'acf_add_options_page' ) ) {
		acf_add_options_page( [
			'page_title' => 'Site Options',
			'menu_title' => 'Site Options',
			'menu_slug'  => 'site-options',
			'capability' => 'edit_posts',
			'redirect'   => false,
		] );
	}
} );

// 3) GraphQL surface — register the SiteOptions types + RootQuery.siteOptions, matching
//    the committed schema. Resolver reads the ACF options ('option' post_id).
add_action( 'graphql_register_types', function () {
	register_graphql_object_type( 'SiteOptionsSocial', [
		'description' => 'A social link in Site Options.',
		'fields'      => [
			'label' => [ 'type' => 'String' ],
			'url'   => [ 'type' => 'String' ],
		],
	] );

	register_graphql_object_type( 'SiteOptionsPhone', [
		'description' => 'A phone number in Site Options (location label + number).',
		'fields'      => [
			'location' => [ 'type' => 'String' ],
			'number'   => [ 'type' => 'String' ],
		],
	] );

	register_graphql_object_type( 'SiteOptions', [
		'description' => 'Editor-managed site-wide chrome (logo, CTA, social, phones).',
		'fields'      => [
			'logo'           => [
				'type'    => 'MediaItem',
				'resolve' => function ( $source, $args, $context ) {
					$id = $source['logo'] ?? null;
					if ( empty( $id ) ) {
						return null;
					}
					return $context->get_loader( 'post' )->load_deferred( (int) $id );
				},
			],
			'strapline'      => [ 'type' => 'String' ],
			'address'        => [ 'type' => 'String' ],
			'headerCtaLabel' => [ 'type' => 'String' ],
			'headerCtaUrl'   => [ 'type' => 'String' ],
			'social'         => [ 'type' => [ 'list_of' => 'SiteOptionsSocial' ] ],
			'socialInHeader' => [ 'type' => 'Boolean' ],
			'phoneNumbers'   => [ 'type' => [ 'list_of' => 'SiteOptionsPhone' ] ],
		],
	] );

	register_graphql_field( 'RootQuery', 'siteOptions', [
		'type'        => 'SiteOptions',
		'description' => 'Editor-managed header/footer chrome.',
		'resolve'     => function () {
			$social = get_field( 'social', 'option' ) ?: [];
			$phones = get_field( 'phone_numbers', 'option' ) ?: [];
			return [
				'logo'           => get_field( 'logo', 'option' ), // attachment ID (return_format: id)
				'strapline'      => get_field( 'strapline', 'option' ) ?: null,
				'address'        => get_field( 'address', 'option' ) ?: null,
				'headerCtaLabel' => get_field( 'header_cta_label', 'option' ) ?: null,
				'headerCtaUrl'   => get_field( 'header_cta_url', 'option' ) ?: null,
				'social'         => array_map( function ( $s ) {
					return [ 'label' => $s['label'] ?? null, 'url' => $s['url'] ?? null ];
				}, $social ),
				'socialInHeader' => (bool) get_field( 'social_in_header', 'option' ),
				'phoneNumbers'   => array_map( function ( $p ) {
					return [ 'location' => $p['location'] ?? null, 'number' => $p['number'] ?? null ];
				}, $phones ),
			];
		},
	] );
} );
