import Image from "next/image";
import Link from "next/link";
import { Container } from "@/ui/container";
import { ButtonLink } from "@/ui/button-link";
import { MobileNavDrawer, type NavItem } from "./mobile-nav-drawer";
import { siteConfig } from "../../site.config";

// Server Component shell — passes nav links down to the Client Component leaf
// (slot-bridge pattern, workflow/02, KB 09 §Mobile nav pattern). The header
// itself never uses "use client".

export function Header() {
  const { logo, nav, headerCta, name } = siteConfig;
  const cta = headerCta.label && headerCta.href ? { label: headerCta.label, href: headerCta.href } : null;

  return (
    <header className="border-b border-border bg-surface" aria-label="Main">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            aria-label={name}
            className="flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {logo.src ? (
              <Image src={logo.src} alt={logo.alt || name} width={160} height={40} className="h-8 w-auto" priority />
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

            {cta ? (
              <ButtonLink href={cta.href} size="sm" className="hidden lg:inline-flex">
                {cta.label}
              </ButtonLink>
            ) : null}

            <MobileNavDrawer links={nav as readonly NavItem[]} cta={cta} />
          </div>
        </div>
      </Container>
    </header>
  );
}
