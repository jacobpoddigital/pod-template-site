<?php
/**
 * Plugin Name: Pod Case Study — example custom post type (GraphQL)
 * Description: Registers the `case_study` CUSTOM POST TYPE and exposes it to WPGraphQL.
 *              This is the TEMPLATE'S REFERENCE CPT — the worked example of taking a
 *              registered post type all the way to typed, statically-generated frontend
 *              routes (/case-studies + /case-studies/[slug]). The matching ACF group
 *              lives in wp/acf-fields/*-case-study.json (exposed as `caseStudyFields`),
 *              the queries in src/lib/cms/queries/case-stud*.graphql, and the data layer
 *              in src/lib/cms/case-studies.ts.
 *
 * To add ANOTHER CPT (e.g. team members, services, locations): copy this file, change
 * the post type key + graphql names, copy the ACF group JSON, the queries, the data
 * layer, the routes, and add the mock fixtures + HANDLERS rows. See docs/custom-post-types.md.
 *
 * KEEP, RENAME, or DELETE per client. If a client has no case studies, delete this
 * plugin, the ACF group, the queries, src/lib/cms/case-studies.ts, the mock, the
 * /case-studies routes, and the CaseStudy types — they are self-contained.
 *
 * GraphQL exposure: show_in_graphql + graphql_single_name "caseStudy" / plural
 * "caseStudies" is what makes WPGraphQL generate RootQuery.caseStudy / .caseStudies and
 * the CaseStudy type the committed SDL (src/lib/cms/schema.graphql) mirrors. The
 * `offsetPagination` where-arg the index uses needs the free WPGraphQL Offset
 * Pagination addon (same as the blog) — provision.sh installs it.
 */

add_action( 'init', function () {
	register_post_type( 'case_study', [
		'labels' => [
			'name'          => 'Case Studies',
			'singular_name' => 'Case Study',
			'menu_name'     => 'Case Studies',
			'add_new_item'  => 'Add New Case Study',
			'edit_item'     => 'Edit Case Study',
		],
		'public'              => true,
		'has_archive'         => false, // the frontend owns /case-studies, not WP's archive.
		'rewrite'             => [ 'slug' => 'case-study' ],
		'menu_icon'           => 'dashicons-awards',
		'menu_position'       => 21,
		'supports'            => [ 'title', 'editor', 'excerpt', 'thumbnail', 'revisions' ],
		// --- WPGraphQL exposure (the lines that make it a first-class GraphQL type) ---
		'show_in_graphql'     => true,
		'graphql_single_name' => 'caseStudy',
		'graphql_plural_name' => 'caseStudies',
	] );
} );
