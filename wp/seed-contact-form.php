<?php
/**
 * seed-contact-form.php — creates the Contact Form 7 form the headless enquiry
 * form (`src/blocks/contact-form/action.ts`) submits to via CF7's REST feedback
 * endpoint. Field names (your-name/your-email/your-enquiry/your-message) match the
 * Server Action's payload 1:1. Idempotent — re-running updates the existing form.
 *
 * TEMPLATE: set SITE_NAME, MAIL_SENDER and MAIL_RECIPIENT below to the client's
 * details before running (see docs/contact-form.md §Per-client setup).
 *
 * Run: docker compose run --rm --user root --entrypoint bash cli \
 *        -c "wp --allow-root --path=/var/www/html eval-file /opt/pod-wp/seed-contact-form.php"
 */

if ( ! class_exists( 'WPCF7_ContactForm' ) ) {
	WP_CLI::error( 'Contact Form 7 is not active — install/activate it first.' );
}

// TEMPLATE: fill these in per client.
$SITE_NAME      = 'the site';
$MAIL_SENDER    = 'WordPress <wordpress@example.com>';
$MAIL_RECIPIENT = 'jacob@poddigital.co.uk';

$title = 'Website enquiry';
$existing = get_page_by_title( $title, OBJECT, 'wpcf7_contact_form' );

$form_body = <<<'FORM'
<p>[text* your-name placeholder "Your name"]</p>
<p>[email* your-email placeholder "Your email"]</p>
<p>[select* your-enquiry "General enquiry" "Request a quote" "Support"]</p>
<p>[textarea* your-message placeholder "How can we help?"]</p>
[submit "Send enquiry"]
FORM;

$mail = array(
	'subject'    => "New enquiry from [your-name] via {$SITE_NAME}",
	'sender'     => $MAIL_SENDER,
	'body'       => "Name: [your-name]\nEmail: [your-email]\nEnquiry type: [your-enquiry]\n\nMessage:\n[your-message]\n\n--\nSent from the {$SITE_NAME} contact form.",
	'recipient'  => $MAIL_RECIPIENT,
	'additional_headers' => 'Reply-To: [your-email]',
	'attachments' => '',
	'use_html'   => 0,
	'exclude_blank' => 0,
);

if ( $existing ) {
	$cf = WPCF7_ContactForm::get_instance( $existing->ID );
} else {
	$cf = WPCF7_ContactForm::get_template( array( 'title' => $title ) );
}
$cf->set_properties( array(
	'form' => $form_body,
	'mail' => $mail,
	'mail_2' => $cf->prop( 'mail_2' ),
	'messages' => $cf->prop( 'messages' ),
	'additional_settings' => $cf->prop( 'additional_settings' ),
) );
$cf->save();

WP_CLI::success( "Contact Form 7 form '{$title}' saved (ID {$cf->id()})." );
