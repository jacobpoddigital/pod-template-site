import Script from "next/script";

// Measurement layer (boilerplate §14/§15, measurement-first ADR 0003 amended): GTM is the single
// tag container; Consent Mode v2 is set DEFAULT-DENIED before GTM loads. GA4 / Google Ads / Meta
// tags live INSIDE the GTM container (configured in the GTM UI), not in code — so this file rarely
// changes per client; only the GTM ID does.
//
// INERT until NEXT_PUBLIC_GTM_ID is set AND the build is production — local/dev/mock stay clean and
// emit nothing. A CMP grants consent at runtime via src/lib/analytics/consent.ts (updateConsent()).
// See docs/measurement-and-consent.md.

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const COOKIEBOT_ID = process.env.NEXT_PUBLIC_COOKIEBOT_ID;
const PROD = process.env.NODE_ENV === "production";
const ENABLED = !!GTM_ID && PROD;
const CMP_ENABLED = !!COOKIEBOT_ID && PROD;

// Consent Mode v2 — deny ad + analytics storage by default; functionality/security need no consent.
// wait_for_update gives a CMP 500ms to call gtag('consent','update',…) before tags decide. Also
// exposes window.gtag so the consent helpers can push updates.
const CONSENT_DEFAULT =
  "window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};" +
  "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'," +
  "analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});";

function gtmLoader(id: string): string {
  return (
    "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});" +
    "var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;" +
    "j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})" +
    `(window,document,'script','dataLayer','${id}');`
  );
}

/** Consent-default (always first) + the Cookiebot CMP loader + the GTM loader. Render once in
 *  the root layout. Each part is independently gated, so a site can run the CMP before GTM is set. */
export function Analytics() {
  if (!ENABLED && !CMP_ENABLED) return null;
  return (
    <>
      {/* Consent Mode v2 default-denied MUST run before any tag (defines window.gtag). */}
      <Script id="consent-default" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT }} />
      {/* Cookiebot CMP — renders the banner, stores the choice; the bridge maps it to Consent Mode. */}
      {CMP_ENABLED ? (
        <Script
          id="Cookiebot"
          strategy="beforeInteractive"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid={COOKIEBOT_ID}
          data-blockingmode="auto"
        />
      ) : null}
      {ENABLED ? <Script id="gtm" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: gtmLoader(GTM_ID as string) }} /> : null}
    </>
  );
}

/** Whether the Cookiebot bridge should mount (the layout renders <CookiebotBridge/> when true). */
export const cmpEnabled = CMP_ENABLED;

/** GTM <noscript> fallback iframe. Render first thing inside <body>. */
export function AnalyticsNoScript() {
  if (!ENABLED) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
