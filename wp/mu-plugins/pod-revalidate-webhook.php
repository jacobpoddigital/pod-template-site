<?php
/**
 * Plugin Name: Pod Revalidate Webhook — content-change → frontend ISR
 * Description: When content changes in WP, POST the frontend's /api/revalidate?secret=…
 *              with the affected cache tags so Next purges + regenerates instantly.
 *              GENERIC — identical for every Pod headless site. The inverse half of
 *              src/app/api/revalidate/route.ts (tags must match src/lib/cms/cache-tags.ts).
 *
 * Config (no secret ever written to a repo file):
 *   - Target URL: defaults to home_url() — in the headless pattern WP "home" is the FRONTEND
 *     origin (see pod-yoast-headless.php / provision.sh). Override with the POD_REVALIDATE_URL
 *     constant or the `pod_revalidate_url` option if the frontend lives elsewhere.
 *   - Secret: the POD_REVALIDATE_SECRET constant or the `pod_revalidate_secret` option. Must
 *     equal REVALIDATE_SECRET on Vercel. Set it over SSH, NOT in the repo:
 *       wp option update pod_revalidate_secret '<secret>'
 *     With no secret configured the plugin is a no-op (logs once) — safe to ship everywhere.
 *
 * Tag map (mirror of cache-tags.ts):
 *   page        → ["pages", "page:<slug>"]
 *   post        → ["posts", "post:<slug>"]
 *   case_study  → ["case-studies", "case-study:<slug>"]
 *   menu/term/options edits → ["chrome"] (header/footer)
 *
 * Requests are batched per WP request (a single edit fires several hooks) and flushed once on
 * `shutdown`, non-blocking (0.5s timeout, blocking=false) so the editor never waits on the POST.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Pod_Revalidate_Webhook {

	/** @var array<string,bool> de-duplicated tag set for this request */
	private static $tags = array();

	public static function init() {
		// Post saves / status transitions / deletes cover create + edit + publish + trash + restore.
		add_action( 'save_post', array( __CLASS__, 'on_save_post' ), 10, 3 );
		add_action( 'before_delete_post', array( __CLASS__, 'on_delete_post' ), 10, 1 );

		// Chrome (header/footer): menus, and the term changes that show up in nav/listings.
		add_action( 'wp_update_nav_menu', array( __CLASS__, 'queue_chrome' ) );
		add_action( 'created_term', array( __CLASS__, 'on_term_change' ), 10, 3 );
		add_action( 'edited_term', array( __CLASS__, 'on_term_change' ), 10, 3 );
		add_action( 'delete_term', array( __CLASS__, 'on_term_change' ), 10, 3 );

		// Flush the collected tags once, after the response is sent to the editor.
		add_action( 'shutdown', array( __CLASS__, 'flush' ) );
	}

	public static function on_save_post( $post_id, $post, $update ) {
		// Ignore autosaves, revisions, and auto-drafts — only real content changes.
		if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
			return;
		}
		if ( $post->post_status === 'auto-draft' ) {
			return;
		}
		self::queue_for_post( $post );
	}

	public static function on_delete_post( $post_id ) {
		$post = get_post( $post_id );
		if ( $post ) {
			self::queue_for_post( $post );
		}
	}

	private static function queue_for_post( $post ) {
		switch ( $post->post_type ) {
			case 'page':
				self::add( 'pages' );
				self::add( 'page:' . $post->post_name );
				break;
			case 'post':
				self::add( 'posts' );
				self::add( 'post:' . $post->post_name );
				// A new/edited post changes blog listings + archives; also refresh chrome menus
				// only if needed — listings ride the "posts" tag, so nothing extra here.
				break;
			case 'case_study':
				self::add( 'case-studies' );
				self::add( 'case-study:' . $post->post_name );
				break;
			default:
				// Unknown/other post types (e.g. nav_menu_item handled via wp_update_nav_menu,
				// products handled by their own integration) — ignore here.
				break;
		}
	}

	public static function on_term_change( $term_id, $tt_id, $taxonomy ) {
		// Categories/tags drive blog archives + nav; refresh posts + chrome.
		if ( in_array( $taxonomy, array( 'category', 'post_tag' ), true ) ) {
			self::add( 'posts' );
		}
		self::queue_chrome();
	}

	public static function queue_chrome() {
		self::add( 'chrome' );
	}

	private static function add( $tag ) {
		self::$tags[ $tag ] = true;
	}

	public static function flush() {
		if ( empty( self::$tags ) ) {
			return;
		}

		$secret = self::config( 'POD_REVALIDATE_SECRET', 'pod_revalidate_secret' );
		if ( ! $secret ) {
			// No secret → don't POST (the endpoint would 401 anyway). Log once for setup visibility.
			error_log( 'pod-revalidate: skipped — no secret configured (set option pod_revalidate_secret).' );
			return;
		}

		$base = self::config( 'POD_REVALIDATE_URL', 'pod_revalidate_url' );
		if ( ! $base ) {
			$base = home_url();
		}
		$endpoint = trailingslashit( $base ) . 'api/revalidate?secret=' . rawurlencode( $secret );

		$tags = array_keys( self::$tags );
		self::$tags = array();

		wp_remote_post(
			$endpoint,
			array(
				'timeout'  => 0.5,
				'blocking' => false, // fire-and-forget: never block the editor on the frontend
				'headers'  => array( 'Content-Type' => 'application/json' ),
				'body'     => wp_json_encode( array( 'tags' => $tags ) ),
			)
		);
	}

	private static function config( $const, $option ) {
		if ( defined( $const ) && constant( $const ) ) {
			return constant( $const );
		}
		$val = get_option( $option );
		return $val ? $val : null;
	}
}

Pod_Revalidate_Webhook::init();
