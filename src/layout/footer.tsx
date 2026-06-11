import Link from "next/link";
import { Container } from "@/ui/container";
import { siteConfig } from "../../site.config";

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

export function Footer() {
  const { name, footer } = siteConfig;
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="mt-auto bg-ink py-12 text-surface">
      <Container>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold">{name}</p>
            <p className="mt-2 max-w-[40ch] text-sm text-surface/70">{footer.strapline}</p>
            {footer.address ? (
              <address className="mt-4 whitespace-pre-line text-sm not-italic text-surface/70">{footer.address}</address>
            ) : null}
          </div>

          {footer.columns.map((col) => (
            <FooterNav key={col.title} title={col.title} links={col.links} />
          ))}

          {footer.social.length ? (
            <div>
              <p className="text-sm font-semibold">Follow</p>
              <ul className="mt-3 space-y-2">
                {footer.social.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded text-sm text-surface/70 transition-colors hover:text-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-surface/15 pt-6 text-sm text-surface/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {footer.company}. All rights reserved.
          </p>
          {footer.legal.length ? (
            <ul className="flex flex-wrap gap-4">
              {footer.legal.map((l) => (
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
