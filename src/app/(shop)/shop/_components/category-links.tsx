import Link from "next/link";
import { GENDERS, TYPES, type Gender, type ShoeType } from "../_lib/taxonomy";

// Contextual internal links between sibling categories (category-listing UX standard / SEO):
// category pages are the mid-tier link hubs, so cross-link the other types for this gender + the
// same type for the other gender. Pill links = ≥40px targets, borders not shadows, one type rung.
export function CategoryLinks({ gender, type }: { gender: Gender; type: ShoeType }) {
  const otherGender = GENDERS.find((g) => g.slug !== gender.slug);
  const links = [
    ...TYPES.filter((t) => t.slug !== type.slug).map((t) => ({
      href: `/shop/${gender.slug}/${t.slug}`,
      label: `${gender.name} ${t.name.toLowerCase()}`,
    })),
    ...(otherGender ? [{ href: `/shop/${otherGender.slug}/${type.slug}`, label: `${otherGender.name} ${type.name.toLowerCase()}` }] : []),
  ];

  return (
    <nav aria-label="Related categories" className="mt-6">
      <h2 className="label mb-3 text-muted-foreground">Keep browsing</h2>
      <ul className="flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 body-sm text-foreground transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
