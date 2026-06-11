import Link from "next/link";
import { Container } from "@/ui/container";
import { SocialLinks } from "./social-icons";
import { ThemeToggle } from "./theme-toggle";
import { siteConfig } from "../../site.config";
import type { SiteChrome } from "@/lib/cms";

function FooterNav({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <p className="body-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="rounded body-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer({ chrome }: { chrome: SiteChrome }) {
  const { name, footer: cfg } = siteConfig;
  const f = chrome.footer;
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="mt-auto border-t border-border bg-surface-muted py-12 text-ink">
      <Container>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="display-xs">{name}</p>
            {f.strapline ? <p className="mt-2 max-w-[40ch] body-sm text-ink-muted">{f.strapline}</p> : null}
            {f.address ? (
              <address className="mt-4 whitespace-pre-line body-sm not-italic text-ink-muted">{f.address}</address>
            ) : null}
          </div>

          {f.columns.map((col) => (
            <FooterNav key={col.title} title={col.title} links={col.links} />
          ))}

          {chrome.social.length ? (
            <div>
              <p className="body-sm font-semibold">Follow</p>
              <SocialLinks links={chrome.social} className="mt-3" itemClassName="text-ink-muted hover:text-ink" />
            </div>
          ) : null}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 body-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {cfg.company}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {cfg.legal.length ? (
              <ul className="flex flex-wrap gap-4">
                {cfg.legal.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="rounded transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <ThemeToggle />
          </div>
        </div>
      </Container>
    </footer>
  );
}
