// Live-contract check — validate every committed GraphQL document against the LIVE
// WordPress schema (the live-build CI gate, docs/workflow/39-live-build-ci-gate.md).
//
// THE FAILURE CLASS THIS KILLS: a committed query asks live WP for a field the
// provisioning never actually created (unprovisioned ACF group, missing plugin,
// mock≠live type names). `pnpm build` against mock stays green because the mock serves
// the committed schema; the live build then 500s one field at a time. This runs in CI
// AFTER provisioning a real WP, introspects its SDL, and fails fast naming the EXACT
// field — instead of a human discovering it field-by-field at build time.
//
// It is schema-shape validation only (graphql-js `validate`) — fast, no Next build. The
// nightly `live-build` job is the full-render backstop.
//
// Usage:  node scripts/check-live-contract.mjs <live-sdl-file> [extra-doc-dir ...]
//   <live-sdl-file>  the introspected SDL, e.g. produced by:
//       pnpm dlx get-graphql-schema "$WPGRAPHQL_URL" > /tmp/live.graphql
//   extra-doc-dir    optional additional query dirs (repo-relative)
//
// Validates src/lib/cms/queries/**/*.graphql and, when present (commerce module repos),
// src/lib/commerce/queries/**/*.graphql. Both resolve against the single live endpoint's
// SDL (cms + WooGraphQL types live on one /graphql). Shared fragments (queries/fragments/)
// are prepended to each operation file so spreads resolve and errors are attributed per file.
//
// Exit: 0 = every document validates; 1 = at least one document references something the
// live schema doesn't expose (or a parse error); 2 = usage / unreadable SDL.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSchema, parse, validate, specifiedRules } from "graphql";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sdlPath = process.argv[2];
if (!sdlPath) {
  console.error("usage: node scripts/check-live-contract.mjs <live-sdl-file> [extra-doc-dir ...]");
  process.exit(2);
}

let schema;
try {
  // assumeValidSDL: trust WP's introspected SDL as-is — we're validating OUR documents
  // against it, not auditing WordPress's own schema.
  schema = buildSchema(readFileSync(sdlPath, "utf8"), { assumeValidSDL: true });
  // WPGraphQL's own schema trips graphql-js's strict interface-covariance check
  // (e.g. Connection.nodes is [Node!]! but RootQueryToContentNodeConnection.nodes is
  // [ContentNode!]!). validate() calls assertValidSchema() first and would throw on these
  // WordPress-internal quirks. We only care whether OUR documents conform, so mark the
  // schema as already-validated (no schema-level errors) to skip that gate.
  schema.__validationErrors = [];
} catch (e) {
  console.error(`✗ could not build a schema from ${sdlPath}: ${e.message}`);
  process.exit(2);
}

// Document dirs: cms always; commerce when the module exists; plus any extra dirs passed.
const docDirs = ["src/lib/cms/queries"];
if (existsSync(join(root, "src/lib/commerce/queries"))) docDirs.push("src/lib/commerce/queries");
docDirs.push(...process.argv.slice(3));

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith(".graphql")) out.push(p);
  }
  return out;
}

const files = docDirs.flatMap((d) => {
  const abs = join(root, d);
  return existsSync(abs) ? walk(abs) : [];
});
if (files.length === 0) {
  console.error(`✗ no .graphql documents found under: ${docDirs.join(", ")}`);
  process.exit(2);
}

// Named fragment definitions live in */fragments/ and are spread into operations. Prepend
// them to every operation file so spreads resolve; drop NoUnusedFragments (we deliberately
// supply all fragments to each file, so most go "unused" per file — not a real defect).
const rel = (f) => relative(root, f);
const fragmentFiles = files.filter((f) => f.includes(`${"/fragments/"}`));
const operationFiles = files.filter((f) => !f.includes(`${"/fragments/"}`));
const fragmentSrc = fragmentFiles.map((f) => readFileSync(f, "utf8")).join("\n");
const rules = specifiedRules.filter((r) => r.name !== "NoUnusedFragmentsRule");

// OPT-IN MODULES: documents that belong to a capability the BASE provision doesn't install
// (so a brochure site never pays for it). They're validated for real WHEN that capability is
// present in the live schema, and skipped-with-notice when it isn't — never silently passed,
// never failing the base template. Detection probes a sentinel field on the live schema.
// (Commerce queries live in src/lib/commerce/queries and are already gated by dir existence.)
function probe(typeName, fieldName) {
  const t = schema.getType(typeName);
  return !!(t && typeof t.getFields === "function" && t.getFields()[fieldName]);
}
const OPTIONAL_GROUPS = [
  {
    label: "auth (WPGraphQL JWT plugin — opt-in; see docs/auth.md)",
    match: (f) => /\/auth-(login|refresh)\.graphql$/.test(f),
    present: () => probe("RootMutation", "login"),
  },
];
function optionalGroupFor(file) {
  return OPTIONAL_GROUPS.find((g) => g.match(file.replace(/\\/g, "/")));
}

let failed = 0;
let skipped = 0;
for (const f of operationFiles) {
  const group = optionalGroupFor(f);
  if (group && !group.present()) {
    skipped++;
    console.log(`⊘ ${rel(f)} — skipped: ${group.label} not installed in this WP`);
    continue;
  }
  const source = `${fragmentSrc}\n${readFileSync(f, "utf8")}`;
  let ast;
  try {
    ast = parse(source);
  } catch (e) {
    failed++;
    console.error(`✗ ${rel(f)} — parse error: ${e.message}`);
    continue;
  }
  const errors = validate(schema, ast, rules);
  if (errors.length) {
    failed++;
    console.error(`✗ ${rel(f)}`);
    for (const e of errors) console.error(`    ${e.message}`);
  } else {
    console.log(`✓ ${rel(f)}`);
  }
}

const checked = operationFiles.length - skipped;
console.log("");
if (failed) {
  console.error(`✗ live-contract FAILED: ${failed}/${checked} checked document(s) reference fields the live WordPress schema does not expose${skipped ? ` (${skipped} opt-in document(s) skipped)` : ""}.`);
  console.error("  Fix the WP side (register/seed the missing ACF group, plugin, or menu in wp/) — do NOT trim the query to match a half-provisioned WP.");
  process.exit(1);
}
console.log(`✓ live-contract PASSED: ${checked} document(s) validate against the live WordPress schema${skipped ? `; ${skipped} opt-in document(s) skipped (capability not installed)` : ""}.`);
