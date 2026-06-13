// Consent Mode v2 helpers (boilerplate §14, measurement-first ADR 0003 amended). The default
// state is DENIED, set inline before GTM loads (see src/app/analytics.tsx). A CMP (or a consent
// banner) calls updateConsent() when the visitor accepts/rejects — Google tags then respect it
// automatically; any NON-Google tag must check the choice before firing. CMP-agnostic by design:
// whichever CMP we standardise on just needs to call grantAll()/denyAll()/updateConsent() from
// its accept/reject handler. See docs/measurement-and-consent.md §CMP.

export interface ConsentChoice {
  /** analytics_storage (GA4) */
  analytics: boolean;
  /** ad_storage + ad_user_data + ad_personalization (Google Ads, Meta) */
  ads: boolean;
}

type Gtag = (...args: unknown[]) => void;

function getGtag(): Gtag | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { gtag?: Gtag }).gtag ?? null;
}

/** Global Privacy Control — the browser/extension "do not sell or share" opt-out signal
 *  (CCPA/CPRA; actively enforced — research/2026-06-13-build-gap-analysis §1.1). When the
 *  visitor sends GPC we MUST NOT grant ads/targeting consent, regardless of any CMP choice.
 *  (analytics_storage stays per-choice — GPC targets sale/sharing, i.e. advertising.) */
export function gpcEnabled(): boolean {
  if (typeof navigator === "undefined") return false;
  return (navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

/** Push a Consent Mode v2 update. Call from the CMP's accept/reject handler. No-op until GTM is
 *  wired. GPC overrides any ad grant (do-not-sell/share). */
export function updateConsent({ analytics, ads }: ConsentChoice): void {
  const gtag = getGtag();
  if (!gtag) return;
  const adsAllowed = ads && !gpcEnabled();
  gtag("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: adsAllowed ? "granted" : "denied",
    ad_user_data: adsAllowed ? "granted" : "denied",
    ad_personalization: adsAllowed ? "granted" : "denied",
  });
}

export function grantAll(): void {
  updateConsent({ analytics: true, ads: true });
}

export function denyAll(): void {
  updateConsent({ analytics: false, ads: false });
}
