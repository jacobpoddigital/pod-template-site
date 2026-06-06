<?php
/**
 * Seed content for local dev — run via `wp eval-file` from wp/provision.sh.
 * Creates the `home` page (idempotent) and fills its ACF blocks.
 * TEMPLATE: placeholder copy — replace with the client's approved copy
 * (content/copy-NN.md) and keep in sync with src/lib/cms/fallback.ts.
 */

$page = get_page_by_path( 'home', OBJECT, 'page' );
if ( ! $page ) {
	$page_id = wp_insert_post( array(
		'post_type'   => 'page',
		'post_title'  => 'Home',
		'post_name'   => 'home',
		'post_status' => 'publish',
	) );
	if ( is_wp_error( $page_id ) ) {
		WP_CLI::error( 'Could not create home page: ' . $page_id->get_error_message() );
	}
	WP_CLI::log( "Created page 'home' (ID $page_id)" );
} else {
	$page_id = $page->ID;
	WP_CLI::log( "Page 'home' exists (ID $page_id)" );
}

$blocks = array(
	array(
		'acf_fc_layout' => 'hero',
		'heading'       => 'Seeded from WordPress: replace with client copy',
		'subheading'    => 'If you can read this on the frontend, the CMS round-trip works.',
		'cta_label'     => 'Primary action',
		'cta_url'       => '/#contact',
	),
	array(
		'acf_fc_layout' => 'card_grid',
		'heading'       => 'What you get',
		'cards'         => array(
			array( 'title' => 'Benefit one', 'body' => 'One objection-answer per card.' ),
			array( 'title' => 'Benefit two', 'body' => 'Numbers over adjectives.' ),
			array( 'title' => 'Benefit three', 'body' => 'Under 160 characters each.' ),
		),
	),
	array(
		'acf_fc_layout' => 'process_steps',
		'heading'       => 'How it works',
		'steps'         => array(
			array( 'title' => 'Step one', 'body' => 'Concrete and short.' ),
			array( 'title' => 'Step two', 'body' => 'What they see, when.' ),
			array( 'title' => 'Step three', 'body' => 'Outcome with a number.' ),
		),
	),
);

update_field( 'field_pod_blocks', $blocks, $page_id );
WP_CLI::success( "Seeded ACF blocks on page $page_id" );
