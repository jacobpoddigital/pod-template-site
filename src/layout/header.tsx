import Link from "next/link";
import { Container } from "@/ui/container";
import { siteConfig } from "../../site.config";

// MVP: nav from site.config.ts. Later: WP menu via getGlobalSettings().

export function Header() {
  return (
    <header className="border-b border-brand-light bg-surface">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold text-brand">
            {siteConfig.name}
          </Link>
          <nav aria-label="Main">
            <ul className="flex gap-6">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-ink-muted transition-colors hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  );
}
