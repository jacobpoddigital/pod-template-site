<?php
/**
 * Plugin Name: Pod Category Image — Category.categoryImage (GraphQL)
 * Description: Hand-registers `categoryImage: MediaItem` on the WPGraphQL `Category` type so
 *              the frontend's blog-category queries (all-categories.graphql /
 *              category-by-slug.graphql) resolve the ACF term-image banner. Matches the
 *              committed schema (src/lib/cms/schema.graphql → `categoryImage: MediaItem`).
 *
 * Why hand-registered (not wpgraphql-acf auto-exposure): wpgraphql-acf 2.x exposes an ACF
 * image field as an AcfMediaItemConnectionEdge (`categoryImage { node { ... } }`), NOT the
 * flat `categoryImage { sourceUrl ... }` MediaItem the committed schema + frontend query
 * declare. Explicit registration is deterministic and matches the schema. (Same stance as
 * pod-chrome-register.php's siteOptions.logo.)
 *
 * The editor UI (the ACF image field on the `category` taxonomy) lives in
 * wp/acf-fields/*-category-image.json; field NAME `category_image` is the contract this
 * resolver reads. GENERIC — identical for every Pod site with a standard blog.
 */

add_action( 'graphql_register_types', function () {
	register_graphql_field( 'Category', 'categoryImage', [
		'type'        => 'MediaItem',
		'description' => 'Editor-managed banner/card image for the category archive (ACF term image).',
		'resolve'     => function ( $source, $args, $context ) {
			// $source is the WPGraphQL Term model; ACF reads term meta via the "term_{id}" id.
			$term_id = $source->databaseId ?? ( $source->term_id ?? null );
			if ( empty( $term_id ) ) {
				return null;
			}
			$attachment_id = get_field( 'category_image', 'term_' . (int) $term_id ); // return_format: id
			if ( empty( $attachment_id ) ) {
				return null;
			}
			return $context->get_loader( 'post' )->load_deferred( (int) $attachment_id );
		},
	] );
} );
