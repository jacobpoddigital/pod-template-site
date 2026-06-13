// JSON-LD validation gate (research/2026-06-13-build-gap-analysis §8). We emit a lot of
// structured data now (Organization, Article, BreadcrumbList, Person/ProfilePage, FAQPage)
// and nothing checked it. This crawls key routes against a running build, extracts every
// <script type="application/ld+json">, and asserts: it parses, every node has @type, each
// block has @context, and a post carries AT MOST ONE Article/BlogPosting (the single-source
// rule — no duplicate Article from Yoast + our fallback). Run via `pnpm jsonld` (needs a
// build + `next start`). CI job is pasted by a human (agency policy blocks agent CI edits).

const BASE = process.env.JSONLD_BASE || "http://localhost:3000";
const ROUTES = ["/", "/blog", "/blog/how-headless-wordpress-speeds-up-your-site"];

let failures = 0;
const fail = (msg) => { console.error(`  ✗ ${msg}`); failures++; };

function extractBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
}

for (const route of ROUTES) {
  let html;
  try {
    const res = await fetch(BASE + route);
    if (!res.ok) { fail(`${route}: HTTP ${res.status}`); continue; }
    html = await res.text();
  } catch (err) {
    fail(`${route}: fetch failed — ${err.message}`);
    continue;
  }

  const blocks = extractBlocks(html);
  if (blocks.length === 0) { fail(`${route}: no JSON-LD found`); continue; }

  const types = [];
  for (const raw of blocks) {
    let data;
    try {
      data = JSON.parse(raw.replace(/\\u003c/g, "<")); // undo the <-escape we emit
    } catch (err) {
      fail(`${route}: a JSON-LD block does not parse — ${err.message}`);
      continue;
    }
    if (!data["@context"]) fail(`${route}: a JSON-LD block is missing @context`);
    const nodes = Array.isArray(data["@graph"]) ? data["@graph"] : [data];
    for (const n of nodes) {
      if (!n || !n["@type"]) fail(`${route}: a JSON-LD node is missing @type`);
      else types.push(String(n["@type"]));
    }
  }

  if (route.startsWith("/blog/") && route !== "/blog") {
    const articles = types.filter((t) => t === "Article" || t === "BlogPosting").length;
    if (articles > 1) fail(`${route}: ${articles} Article/BlogPosting nodes — violates single-source rule`);
  }
  console.log(`  ✓ ${route}: ${blocks.length} block(s) — ${[...new Set(types)].join(", ")}`);
}

if (failures > 0) {
  console.error(`\nJSON-LD validation FAILED with ${failures} problem(s).`);
  process.exit(1);
}
console.log("\nJSON-LD validation passed.");
