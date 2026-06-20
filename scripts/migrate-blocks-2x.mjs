// One-shot migration helper: emit the wpgraphql-acf 2.x block contract from
//   - the OLD committed schema (src/lib/cms/schema.graphql) → prop names the blocks/zod expect
//   - the LIVE SDL (arg 1) → the real 2.x type + field names the generated ACF group produces
// Outputs (to /tmp): the new schema SDL block, the page-by-slug query fragments, and the
// adapter __typename→layout map. We MATCH structurally so nested/renamed repeaters line up.
//
// Run: node scripts/migrate-blocks-2x.mjs /tmp/live-schema.graphql
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "graphql";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// argv[2] = live SDL path; argv[3] = OLD committed schema path (defaults to the repo's, but
// once migrated you must pass the pre-migration copy, e.g. `git show HEAD:…` saved to /tmp).
const liveAst = parse(readFileSync(process.argv[2], "utf8"));
const oldAst = parse(readFileSync(process.argv[3] || join(root, "src/lib/cms/schema.graphql"), "utf8"));

const OLD_PREFIX = "Page_Pagefields_Blocks_";
const snake = (s) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

function objectMap(ast, pred) {
  const m = new Map();
  for (const d of ast.definitions) if (d.kind === "ObjectTypeDefinition" && pred(d.name.value)) m.set(d.name.value, d);
  return m;
}
const oldTypes = objectMap(oldAst, (n) => n.startsWith(OLD_PREFIX));
const liveTypes = objectMap(liveAst, (n) => n.startsWith("PageFieldsBlocks"));

function unwrap(t) {
  let node = t, list = false;
  if (node.kind === "NonNullType") node = node.type;
  if (node.kind === "ListType") { list = true; node = node.type; if (node.kind === "NonNullType") node = node.type; }
  return { name: node.kind === "NamedType" ? node.name.value : null, list };
}
// classify an old field: scalar | image | repeater(+subType)
function classifyOld(f) {
  const { name, list } = unwrap(f.type);
  if (list && oldTypes.has(name)) return { kind: "repeater", sub: name };
  if (name === "MediaItem") return { kind: "image" };
  return { kind: "scalar", type: name };
}
function classifyLive(f) {
  const { name, list } = unwrap(f.type);
  if (list && liveTypes.has(name)) return { kind: "repeater", sub: name };
  if (name === "AcfMediaItemConnectionEdge") return { kind: "image" };
  return { kind: "scalar", type: name };
}
const liveFields = (def) => def.fields.filter((f) => f.name.value !== "fieldGroupName").map((f) => ({ name: f.name.value, ...classifyLive(f) }));
const scalarNames = (def) => liveFields(def).filter((x) => x.kind === "scalar").map((x) => x.name).sort().join(",");

// Match an old layout to its live layout by the Pascal suffix.
const liveLayoutOf = (oldName) => "PageFieldsBlocks" + oldName.slice(OLD_PREFIX.length) + "Layout";

// Match every old field of a type to its live field. Scalars/images by identical name,
// then leftover scalars POSITIONALLY (wpgraphql-acf's camelCaser doesn't round-trip single
// -letter segments: option_a_label→optionAlabel — declaration order pairs them safely).
// Repeaters by sub-field-scalar signature (robust to rename + reorder).
function matchType(oldDef, liveDef) {
  const lf = liveFields(liveDef);
  const used = new Set();
  const map = new Map(); // old field name -> live field
  const olds = oldDef.fields.map((f) => ({ f, c: classifyOld(f) }));
  for (const { f, c } of olds) {
    if (c.kind === "scalar") continue; // scalars in pass 2
    if (c.kind === "image") {
      const m = lf.find((x) => x.kind === "image" && !used.has(x.name)) || lf.find((x) => x.name === f.name.value && !used.has(x.name));
      if (m) { used.add(m.name); map.set(f.name.value, { ...c, live: m }); }
    } else {
      const oldSig = scalarNames(oldTypes.get(c.sub));
      const cands = lf.filter((x) => x.kind === "repeater" && !used.has(x.name));
      const m = cands.find((x) => scalarNames(liveTypes.get(x.sub)) === oldSig) || cands[0];
      if (m) { used.add(m.name); map.set(f.name.value, { ...c, live: m }); }
    }
  }
  // pass 2: scalars by NORMALIZED name (lowercase, alphanumerics only) — robust to
  // wpgraphql-acf's camelCaser quirk (optionALabel ↔ optionAlabel both → "optionalabel").
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const { f, c } of olds) {
    if (c.kind !== "scalar") continue;
    const m = lf.find((x) => x.kind === "scalar" && !used.has(x.name) && norm(x.name) === norm(f.name.value));
    if (m) { used.add(m.name); map.set(f.name.value, { ...c, live: m }); }
  }
  return map;
}

// ---- emit query fragment selection for a type (recursive) ----
function selection(oldDef, liveDef, indent) {
  const pad = "  ".repeat(indent);
  const matches = matchType(oldDef, liveDef);
  const lines = [];
  for (const f of oldDef.fields) {
    let prop = snake(f.name.value);       // the snake_case name blocks/zod expect
    const m = matches.get(f.name.value);
    if (!m || !m.live) { lines.push(`${pad}# UNMATCHED ${prop}`); continue; }
    // The Columns block's repeater is `column_items` (the old query renamed it to avoid
    // colliding with the scalar `columns` column-count used by other blocks). Honour it.
    if (m.kind === "repeater" && prop === "columns") prop = "column_items";
    const live = m.live.name;
    if (m.kind === "scalar") {
      lines.push(live === prop ? `${pad}${prop}` : `${pad}${prop}: ${live}`);
    } else if (m.kind === "image") {
      const sel = live === prop ? live : `${prop}: ${live}`;
      lines.push(`${pad}${sel} {`, `${pad}  node { sourceUrl altText mediaDetails { width height } }`, `${pad}}`);
    } else {
      const subSel = selection(oldTypes.get(m.sub), liveTypes.get(m.live.sub), indent + 1);
      const head = live === prop ? prop : `${prop}: ${live}`;
      lines.push(`${pad}${head} {`, subSel, `${pad}}`);
    }
  }
  return lines.join("\n");
}

// ---- emit clean SDL type (recursive collects sub-types) ----
const emittedSdl = new Map();
function emitSdl(liveDef) {
  if (emittedSdl.has(liveDef.name.value)) return;
  const fields = liveFields(liveDef).map((x) => {
    if (x.kind === "image") return `  ${x.name}: AcfMediaItemConnectionEdge`;
    if (x.kind === "repeater") { emitSdl(liveTypes.get(x.sub)); return `  ${x.name}: [${x.sub}]`; }
    return `  ${x.name}: ${x.type}`;
  });
  emittedSdl.set(liveDef.name.value, `type ${liveDef.name.value} {\n${fields.join("\n")}\n}`);
}

const layoutOldNames = [...oldTypes.keys()].filter((n) => {
  // a layout type is one NOT used as a repeater element
  for (const d of oldTypes.values()) for (const f of d.fields) { const u = unwrap(f.type); if (u.list && u.name === n) return false; }
  return true;
}).sort();

const fragments = [], layoutMap = [], liveLayoutTypeNames = [];
for (const oldName of layoutOldNames) {
  const liveName = liveLayoutOf(oldName);
  if (!liveTypes.has(liveName)) { console.error("MISSING live type:", liveName); continue; }
  liveLayoutTypeNames.push(liveName);
  emitSdl(liveTypes.get(liveName));
  fragments.push(`        ... on ${liveName} {\n${selection(oldTypes.get(oldName), liveTypes.get(liveName), 5)}\n        }`);
  layoutMap.push(`  ${liveName}: "${snake(oldName.slice(OLD_PREFIX.length)).replace(/^_/, "")}",`);
}

const sdl = [
  "type PageFields {",
  "  blocks: [PageFieldsBlocks_Layout]",
  "}",
  "",
  `union PageFieldsBlocks_Layout =\n    ${liveLayoutTypeNames.join("\n  | ")}`,
  "",
  "type AcfMediaItemConnectionEdge {",
  "  node: MediaItem",
  "}",
  "",
  [...emittedSdl.values()].join("\n\n"),
].join("\n");

writeFileSync("/tmp/blocks-schema.graphql", sdl + "\n");
writeFileSync("/tmp/blocks-fragments.graphql", fragments.join("\n"));
writeFileSync("/tmp/blocks-layout-map.txt", layoutMap.join("\n"));
console.log(`Emitted ${layoutOldNames.length} layouts. SDL types: ${emittedSdl.size}.`);
console.log("Files: /tmp/blocks-schema.graphql, /tmp/blocks-fragments.graphql, /tmp/blocks-layout-map.txt");
