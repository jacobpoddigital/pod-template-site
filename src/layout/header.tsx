import Link from "next/link";
import { Container } from "@/ui/container";
import { MobileNavDrawer } from "./mobile-nav-drawer";
import { siteConfig } from "../../site.config";

// Server Component shell — passes nav links down to the Client Component leaf
// (slot-bridge pattern, workflow/02, KB 09 §Mobile nav pattern). The header
// itself never uses "use client".

export function Header() {
  return (
    <header className="border-b border-brand-light bg-surface" aria-label="Main">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {siteConfig.name}
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex gap-6">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-ink-muted transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile nav — Client Component leaf */}
          <MobileNavDrawer links={[...siteConfig.nav]} />
        </div>
      </Container>
    </header>
  );
}
