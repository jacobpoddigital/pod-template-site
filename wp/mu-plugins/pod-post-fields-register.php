<?php
/**
 * Plugin Name: Pod Post Fields — E-E-A-T sources (GraphQL)
 * Description: Hand-registers `postFields { sources { label url publisher } }` on the
 *              WPGraphQL `Post` type — the article citation list the frontend's PostBySlug
 *              query reads. Matches src/lib/cms/schema.graphql (Post_Postfields naming).
 *
 * Why hand-registered (not wpgraphql-acf auto-exposure): wpgraphql-acf 2.x would expose the
 * group + repeater under 2.x type names (PostFields / generic repeater), not the committed
 * `Post_Postfields` / `Post_Postfields_Sources` the schema declares. Explicit registration
 * is deterministic + version-proof (same stance as pod-chrome / author / category-image).
 *
 * Editor UI lives in wp/acf-fields/*-post-fields.json (location = post). Field NAMES
 * (sources[label,url,publisher]) are the resolver contract. GENERIC — every Pod blog.
 */

add_action( 'graphql_register_types', function () {
	register_graphql_object_type( 'Post_Postfields_Sources', [
		'description' => 'A cited source on an article (label + URL + publisher).',
		'fields'      => [
			'label'     => [ 'type' => 'String' ],
			'url'       => [ 'type' => 'String' ],
			'publisher' => [ 'type' => 'String' ],
		],
	] );

	register_graphql_object_type( 'Post_Postfields', [
		'description' => 'ACF "Post Fields" group — E-E-A-T citations (workflow/34).',
		'fields'      => [
			'sources' => [ 'type' => [ 'list_of' => 'Post_Postfields_Sources' ] ],
		],
	] );

	register_graphql_field( 'Post', 'postFields', [
		'type'    => 'Post_Postfields',
		'resolve' => function ( $source ) {
			$id   = $source->databaseId ?? ( $source->ID ?? null );
			$rows = $id ? ( get_field( 'sources', (int) $id ) ?: [] ) : [];
			return [
				'sources' => array_map( function ( $r ) {
					return [
						'label'     => $r['label'] ?? null,
						'url'       => $r['url'] ?? null,
						'publisher' => $r['publisher'] ?? null,
					];
				}, $rows ),
			];
		},
	] );
} );
