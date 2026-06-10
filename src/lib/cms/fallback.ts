import type { Page } from "./types";

// Graceful fallback (workflow/01 §Phase 4): the site builds + renders before WordPress is
// connected, and keeps rendering if WP is unreachable at build/ISR time.
// AGNOSTIC SCAFFOLD: the home page ships with NO blocks — it matches the empty registry
// (src/blocks/registry.tsx), so a fresh template builds clean. Per client: register the
// blocks you need, then add their fallback instances here (matching the ACF layouts +
// schemas + the WP seed in wp/provision-content.php). The /styleguide page shows the
// primitive layer in the meantime.
const home: Page = {
  slug: "home",
  title: "Home",
  blocks: [],
};

const pages: Record<string, Page> = { home };

export function getFallbackPage(slug: string): Page | null {
  return pages[slug] ?? null;
}

export function getAllFallbackPages(): Page[] {
  return Object.values(pages);
}
