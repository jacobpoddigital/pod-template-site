import Image from "next/image";
import Link from "next/link";
import { Container } from "@/ui/container";
import { ButtonLink } from "@/ui/button-link";
import { MobileNavDrawer } from "./mobile-nav-drawer";
import { siteConfig } from "../../site.config";
import type { SiteChrome } from "@/lib/cms";

// Server Component shell — chrome (logo/nav/CTA) is editor-managed in WP, fetched
// at the layout and passed in. Nav is passed down to the Client Component drawer
// leaf (slot-bridge pattern, workflow/02). The header never uses "use client".

export function Header({ chrome }: { chrome: SiteChrome }) {
  const { name } = siteConfig;
  const { logo, nav, headerCta } = chrome;

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

          <div className="flex items-center gap-6">
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
