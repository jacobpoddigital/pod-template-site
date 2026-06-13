"use client";

import { useEffect } from "react";
import { updateConsent } from "@/lib/analytics/consent";

// Bridges Cookiebot's consent choice → Consent Mode v2 (boilerplate §14). Cookiebot renders the
// banner + stores the choice; on accept/decline it fires window events. We map its categories to
// our consent API: statistics → analytics_storage, marketing → ad_storage/ad_user_data/ad_personalization.
// (Cookiebot's data-blockingmode="auto" also blocks unconsented tags; this keeps Google Consent Mode
// in sync explicitly so GA4/Ads behave correctly.) Mounted by layout only when the CMP is enabled.

interface CookiebotConsent {
  consent?: { statistics?: boolean; marketing?: boolean };
}

function syncFromCookiebot() {
  const cb = (window as unknown as { Cookiebot?: CookiebotConsent }).Cookiebot;
  if (!cb?.consent) return;
  updateConsent({ analytics: !!cb.consent.statistics, ads: !!cb.consent.marketing });
}

export function CookiebotBridge() {
  useEffect(() => {
    // Cookiebot fires these on the window; both accept and decline land a definite choice.
    window.addEventListener("CookiebotOnAccept", syncFromCookiebot);
    window.addEventListener("CookiebotOnDecline", syncFromCookiebot);
    // If consent was already stored before this mounted, sync once now.
    syncFromCookiebot();
    return () => {
      window.removeEventListener("CookiebotOnAccept", syncFromCookiebot);
      window.removeEventListener("CookiebotOnDecline", syncFromCookiebot);
    };
  }, []);
  return null;
}
