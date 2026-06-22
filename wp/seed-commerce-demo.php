<?php
/**
 * Commerce module — GENERIC demo catalogue (placeholder).
 *
 * Run by wp/provision-commerce.sh (eval-file) so /shop + /product render in local dev with a
 * non-empty store. This is deliberately generic (apparel/accessories) — NOT a real catalogue.
 * A client REPLACES this with their own products (seed or migrate). Delete it for a clean store.
 *
 * Idempotent: guards on SKU (wc_get_product_id_by_sku), so re-running won't duplicate.
 * Covers the two product shapes the storefront special-cases: one VARIABLE product (size
 * attribute → variations) and SIMPLE products. Keep it small; the UI is proven on real data
 * via the Stride Hub POC (docs/commerce.md).
 *
 * @package pod-template-site
 */

if ( ! function_exists( 'wc_get_product_id_by_sku' ) ) {
	fwrite( STDERR, "WooCommerce not active — run wp/provision-commerce.sh first.\n" );
	return;
}

/** Ensure a product_cat term exists; return its term_id. */
function pod_demo_cat( string $name ): int {
	$existing = get_term_by( 'name', $name, 'product_cat' );
	if ( $existing instanceof WP_Term ) {
		return (int) $existing->term_id;
	}
	$res = wp_insert_term( $name, 'product_cat' );
	return is_wp_error( $res ) ? 0 : (int) $res['term_id'];
}

$cat_apparel     = pod_demo_cat( 'Apparel' );
$cat_accessories = pod_demo_cat( 'Accessories' );

/** Create a SIMPLE product if its SKU is new. */
function pod_demo_simple( string $sku, string $name, string $price, int $cat, string $desc ): void {
	if ( wc_get_product_id_by_sku( $sku ) ) {
		return; // already seeded
	}
	$p = new WC_Product_Simple();
	$p->set_name( $name );
	$p->set_sku( $sku );
	$p->set_regular_price( $price );
	$p->set_short_description( $desc );
	$p->set_description( $desc );
	$p->set_catalog_visibility( 'visible' );
	$p->set_manage_stock( false );
	$p->set_stock_status( 'instock' );
	if ( $cat ) {
		$p->set_category_ids( array( $cat ) );
	}
	$p->save();
}

pod_demo_simple( 'POD-TOTE-01', 'Canvas Tote Bag', '18.00', $cat_accessories, 'A sturdy everyday cotton tote — generic demo product.' );
pod_demo_simple( 'POD-MUG-01', 'Enamel Mug', '12.00', $cat_accessories, 'A 350ml enamel mug — generic demo product.' );
pod_demo_simple( 'POD-CAP-01', 'Six-Panel Cap', '22.00', $cat_apparel, 'An adjustable six-panel cap — generic demo product.' );

/** Create a VARIABLE product (size attribute → variations) if its SKU is new. */
if ( ! wc_get_product_id_by_sku( 'POD-TEE-01' ) ) {
	$sizes = array( 'S', 'M', 'L', 'XL' );

	$attr = new WC_Product_Attribute();
	$attr->set_name( 'Size' );
	$attr->set_options( $sizes );
	$attr->set_visible( true );
	$attr->set_variation( true );

	$parent = new WC_Product_Variable();
	$parent->set_name( 'Classic Tee' );
	$parent->set_sku( 'POD-TEE-01' );
	$parent->set_short_description( 'A soft cotton t-shirt — generic demo variable product.' );
	$parent->set_description( 'A soft cotton t-shirt — generic demo variable product (size variations).' );
	$parent->set_attributes( array( $attr ) );
	$parent->set_catalog_visibility( 'visible' );
	if ( $cat_apparel ) {
		$parent->set_category_ids( array( $cat_apparel ) );
	}
	$parent_id = $parent->save();

	foreach ( $sizes as $size ) {
		$v = new WC_Product_Variation();
		$v->set_parent_id( $parent_id );
		$v->set_sku( 'POD-TEE-01-' . $size );
		$v->set_attributes( array( 'size' => $size ) );
		$v->set_regular_price( '24.00' );
		$v->set_manage_stock( false );
		$v->set_stock_status( 'instock' );
		$v->save();
	}
}

echo "Seeded generic demo catalogue: Classic Tee (variable) + 3 simple products in Apparel/Accessories.\n";
