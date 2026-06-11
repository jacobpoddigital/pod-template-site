import Link from "next/link";
import { Container } from "@/ui/container";
import { SocialLinks } from "./social-icons";
import { siteConfig } from "../../site.config";
import type { SiteChrome } from "@/lib/cms";

function FooterNav({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="rounded text-sm text-surface/70 transition-colors hover:text-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
    <footer id="contact" className="mt-auto bg-ink py-12 text-surface">
      <Container>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold">{name}</p>
            {f.strapline ? <p className="mt-2 max-w-[40ch] text-sm text-surface/70">{f.strapline}</p> : null}
            {f.address ? (
              <address className="mt-4 whitespace-pre-line text-sm not-italic text-surface/70">{f.address}</address>
            ) : null}
          </div>

          {f.columns.map((col) => (
            <FooterNav key={col.title} title={col.title} links={col.links} />
          ))}

          {chrome.social.length ? (
            <div>
              <p className="text-sm font-semibold">Follow</p>
              <SocialLinks links={chrome.social} className="mt-3" itemClassName="text-surface/70 hover:text-surface" />
            </div>
          ) : null}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-surface/15 pt-6 text-sm text-surface/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {cfg.company}. All rights reserved.
          </p>
          {cfg.legal.length ? (
            <ul className="flex flex-wrap gap-4">
              {cfg.legal.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="rounded transition-colors hover:text-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </footer>
  );
}
