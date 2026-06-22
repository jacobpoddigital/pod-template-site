import { Footprints, ShieldCheck, Timer, Mountain, type LucideIcon } from "lucide-react";

// TEMPLATE — DEMO TAXONOMY (replace per client). This is a worked example of a two-axis browse
// model (gender × type) carried over from the Stride Hub footwear POC; the labels/blurbs/icons
// below are placeholder content. Rewrite GENDERS + TYPES (and their WP product_cat / pa_gender
// slugs) to match the client's real catalogue, or delete the [gender]/[type] routes if a single
// flat /shop is enough. The mechanism is generic; only the data here is shoe-flavoured.
//
// Type-first taxonomy (pivot 2026-06-20 from terrain-first). Two browse axes:
//   - GENDER  → pa_gender attribute (slugs mens / womens — seeded in wp/seed-facets.php)
//   - TYPE    → product_cat (slugs daily-trainers / stability / racing / trail)
// Both match the store's own AI-agent vocabulary + running-retail convention. Slugs MUST match
// the WordPress slugs. Shared by the header mega-menu, the /shop/[gender]/[type] landing pages,
// and the homepage / search merchandising rows so copy + icons stay in sync.

export type Gender = {
  slug: "mens" | "womens";
  name: string; // "Men's"
  heroTitle: string;
  heroBody: string;
};

export const GENDERS: Gender[] = [
  {
    slug: "mens",
    name: "Men's",
    heroTitle: "Men's running shoes",
    heroBody:
      "Every brand compared on equal footing — daily trainers, stability, racing and trail. Filter by the specs that matter to find the men's shoe that fits how you run.",
  },
  {
    slug: "womens",
    name: "Women's",
    heroTitle: "Women's running shoes",
    heroBody:
      "Every brand compared on equal footing — daily trainers, stability, racing and trail. Filter by the specs that matter to find the women's shoe that fits how you run.",
  },
];

export const getGender = (slug: string): Gender | undefined => GENDERS.find((g) => g.slug === slug);

export type ShoeType = {
  slug: string;
  name: string;
  icon: LucideIcon;
  /** short — merchandising card */
  blurb: string;
  /** category-page hero */
  heroTitle: string;
  heroBody: string;
};

export const TYPES: ShoeType[] = [
  {
    slug: "daily-trainers",
    name: "Daily Trainers",
    icon: Footprints,
    blurb: "Go-to workhorses for everyday miles.",
    heroTitle: "Daily trainers",
    heroBody:
      "Versatile, cushioned shoes for easy runs, steady miles and the odd tempo — the safest, most comfortable choice for building weekly mileage. Filter by cushioning, drop and fit.",
  },
  {
    slug: "stability",
    name: "Stability",
    icon: ShieldCheck,
    blurb: "Support for overpronation.",
    heroTitle: "Stability & support shoes",
    heroBody:
      "Guided-stride shoes for runners who overpronate or want extra support — from gentle GuideRails to full motion control. Filter by support level, cushioning and fit.",
  },
  {
    slug: "racing",
    name: "Racing",
    icon: Timer,
    blurb: "Light, fast, race-day ready.",
    heroTitle: "Race-day shoes",
    heroBody:
      "Lightweight, responsive shoes built for goal pace — from 5K-to-10K speedsters to carbon-plated marathon super-shoes. Filter by the specs that win races.",
  },
  {
    slug: "trail",
    name: "Trail",
    icon: Mountain,
    blurb: "Grip and protection off-road.",
    heroTitle: "Trail running shoes",
    heroBody:
      "Off-road shoes with aggressive grip, rock protection and stability for technical terrain and British weather. Filter by cushioning, drop and width.",
  },
];

export const getType = (slug: string): ShoeType | undefined => TYPES.find((t) => t.slug === slug);
