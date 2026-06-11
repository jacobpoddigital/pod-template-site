import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { Container } from "@/ui/container";
import { ButtonLink } from "@/ui/button-link";
import { MobileNavDrawer } from "./mobile-nav-drawer";
import { PhoneMenu } from "./phone-menu";
import { SocialLinks } from "./social-icons";
import { siteConfig } from "../../site.config";
import type { SiteChrome } from "@/lib/cms";

// Server Component shell — chrome (logo/nav/CTA) is editor-managed in WP, fetched
// at the layout and passed in. Nav is passed down to the Client Component drawer
// leaf (slot-bridge pattern, workflow/02). The header never uses "use client".

export function Header({ chrome }: { chrome: SiteChrome }) {
  const { name } = siteConfig;
  const { logo, nav, headerCta, phoneNumbers, social, socialInHeader } = chrome;
  const singlePhone = phoneNumbers.length === 1 ? phoneNumbers[0] : null;

  return (
    <header className="border-b border-border bg-surface" aria-label="Main">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            aria-label={name}
            className="flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {logo?.sourceUrl ? (
              <Image src={logo.sourceUrl} alt={logo.altText || name} width={160} height={40} className="h-8 w-auto" priority />
            ) : (
              <span className="text-lg font-bold text-ink">{name}</span>
            )}
          </Link>

          <div className="flex items-center gap-3 lg:gap-6">
            {/* Phone — always visible (important on mobile). 1 → tel: link, 2+ → dropdown. */}
            {singlePhone ? (
              <a
                href={`tel:${singlePhone.number.replace(/\s+/g, "")}`}
                className="inline-flex h-11 items-center gap-2 rounded-card px-2 text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{singlePhone.number}</span>
              </a>
            ) : phoneNumbers.length > 1 ? (
              <PhoneMenu numbers={phoneNumbers} />
            ) : null}

            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex gap-6">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {socialInHeader && social.length ? (
              <SocialLinks links={social} className="hidden lg:flex" itemClassName="h-9 w-9 text-ink-muted hover:text-ink" />
            ) : null}

            {headerCta ? (
              <ButtonLink href={headerCta.href} size="sm" className="hidden lg:inline-flex">
                {headerCta.label}
              </ButtonLink>
            ) : null}

            <MobileNavDrawer links={nav} cta={headerCta} />
          </div>
        </div>
      </Container>
    </header>
  );
}
