import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { Container } from "@/ui/container";
import { ButtonLink } from "@/ui/button-link";
import { MobileNavDrawer } from "./mobile-nav-drawer";
import { DesktopNav } from "./desktop-nav";
import { PhoneMenu } from "./phone-menu";
import { SocialLinks } from "./social-icons";
import { StickyHeader } from "./sticky-header";
import { ThemeToggle } from "./theme-toggle";
import { CartButton } from "./cart-button";
import { AccountButton } from "./account-button";
import { SearchAutocomplete } from "./search-autocomplete";
import { ACCOUNT_ENABLED } from "@/lib/commerce/config";
import { siteConfig } from "../../site.config";
import type { SiteChrome } from "@/lib/cms";

// Server Component shell — chrome (logo/nav/CTA) is editor-managed in WP, fetched
// at the layout and passed in. Nav + the sticky/scroll behaviour are passed to
// Client Component leaves (slot-bridge pattern, workflow/02). The header's content
// never uses "use client".

// Phone affordance — 1 number → tel: link, 2+ → dropdown, 0 → nothing. Extracted so the
// Header shell stays flat.
function HeaderPhone({ numbers }: { numbers: SiteChrome["phoneNumbers"] }) {
  const single = numbers.length === 1 ? numbers[0] : null;
  if (single) {
    return (
      <a
        href={`tel:${single.number.replace(/\s+/g, "")}`}
        className="inline-flex h-11 items-center gap-2 rounded-card px-2 body-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Phone className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{single.number}</span>
      </a>
    );
  }
  if (numbers.length > 1) return <PhoneMenu numbers={numbers} />;
  return null;
}

// Storefront chrome — account + basket icons (commerce sites only, opt-in via siteConfig.commerce).
// The account icon additionally requires the commerce account module (ACCOUNT_ENABLED).
function StoreChrome() {
  if (!siteConfig.commerce) return null;
  return (
    <div className="flex items-center">
      {ACCOUNT_ENABLED ? <AccountButton /> : null}
      <CartButton />
    </div>
  );
}

export function Header({ chrome }: { chrome: SiteChrome }) {
  const { name } = siteConfig;
  const { logo, nav, headerCta, phoneNumbers, social, socialInHeader } = chrome;
  const showSearch = siteConfig.commerce; // opt-in: storefront sites only

  return (
    <StickyHeader>
      <Container>
        <div className="flex h-16 items-center justify-between gap-6 lg:h-20">
          <Link
            href="/"
            aria-label={name}
            className="flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {logo?.sourceUrl ? (
              <Image src={logo.sourceUrl} alt={logo.altText || name} width={160} height={40} className="h-8 w-auto" priority />
            ) : (
              <span className="display-xs text-ink">{name}</span>
            )}
          </Link>

          <div className="flex items-center gap-3 lg:gap-6">
            {/* Phone — always visible (important on mobile). */}
            <HeaderPhone numbers={phoneNumbers} />

            {showSearch ? (
              <div className="hidden w-52 md:block lg:w-72">
                <SearchAutocomplete />
              </div>
            ) : null}

            <DesktopNav nav={nav} />

            {socialInHeader && social.length ? (
              <SocialLinks links={social} className="hidden lg:flex" itemClassName="h-9 w-9 text-ink-muted hover:text-ink" />
            ) : null}

            <div className="hidden lg:block">
              <ThemeToggle />
            </div>

            {headerCta ? (
              <ButtonLink href={headerCta.href} size="sm" className="hidden lg:inline-flex">
                {headerCta.label}
              </ButtonLink>
            ) : null}

            <StoreChrome />

            <MobileNavDrawer links={nav} cta={headerCta} />
          </div>
        </div>
      </Container>
    </StickyHeader>
  );
}
