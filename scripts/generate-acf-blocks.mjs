// Generate wp/acf-export.json (the page-blocks ACF flexible-content group) from the
// committed block contract in src/lib/cms/schema.graphql. This is the WP-side half of the
// block system that the frontend (query/schema/adapter/components) already declares —
// "per-client ACF generated at provision time" (workflow/29, HQ FRICTION #70). Keeping it
// generated guarantees WP-ACF and the frontend never drift.
//
// INPUT IS THE 2.x SDL. The committed schema.graphql uses the wpgraphql-acf 2.x naming
// (`PageFieldsBlocks<Layout>Layout`, repeater sub-types `PageFieldsBlocks<...>`, image fields
// typed `AcfMediaItemConnectionEdge`). LAYOUTS ARE THE MEMBERS OF THE `PageFieldsBlocks_Layout`
// UNION — that is the authoritative list. Earlier this scanned for the pre-migration prefix
// `Page_Pagefields_Blocks_`, which the migrated schema no longer contains, so it silently
// produced ZERO layouts; provision.sh then overwrote a good acf-export.json with an empty one
// and every live build 500'd on `pageFields` (mock stayed green). The union-derivation +
// non-empty guard below kill that failure class (HQ FRICTION — live-build CI gate).
//
// Field-name round-trip: snake_case the 2.x camelCase field (faqItems→faq_items,
// cardGridCards→card_grid_cards); wpgraphql-acf re-camelCases the ACF name back, so the SDL
// type the queries target is reproduced. Repeater field names are already globally unique in
// the 2.x schema, so no prefixing is needed here. Sub-field ORDER follows the SDL (alphabetical
// from introspection) — order is editor-cosmetic only; introspection always alphabetises the
// SDL regardless of ACF order, so it never affects the GraphQL contract.
//
// Mapping: String→text · Int/Float→number · Boolean→true_false ·
// AcfMediaItemConnectionEdge→image · [PageFieldsBlocks<Sub>]→repeater (recursive).
//
// Run: node scripts/generate-acf-blocks.mjs  → writes wp/acf-export.json
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse } from "graphql";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sdl = readFileSync(join(root, "src/lib/cms/schema.graphql"), "utf8");
const ast = parse(sdl);

const BLOCK_PREFIX = "PageFieldsBlocks"; // 2.x: every block object type starts with this
const UNION_NAME = "PageFieldsBlocks_Layout"; // members = the flexible-content layouts
const IMAGE_EDGE = "AcfMediaItemConnectionEdge"; // 2.x exposes ACF image fields as this edge

// All block object types (layouts + repeater sub-types) + the layout union.
const objects = new Map();
let union = null;
for (const def of ast.definitions) {
  if (def.kind === "ObjectTypeDefinition" && def.name.value.startsWith(BLOCK_PREFIX)) {
    objects.set(def.name.value, def);
  }
  if (def.kind === "UnionTypeDefinition" && def.name.value === UNION_NAME) {
    union = def;
  }
}

// Guard: if the schema doesn't declare the union (or it's empty), REFUSE to write — never
// silently emit an empty page-blocks group (that is exactly the mock-green/live-500 bug).
if (!union) {
  throw new Error(
    `generate-acf-blocks: union ${UNION_NAME} not found in src/lib/cms/schema.graphql — ` +
      `regenerate the SDL from live WP (pnpm dlx get-graphql-schema "$WPGRAPHQL_URL" > src/lib/cms/schema.graphql) and retry`,
  );
}
const layoutTypes = union.types.map((t) => t.name.value);
if (layoutTypes.length === 0) {
  throw new Error(`generate-acf-blocks: ${UNION_NAME} has 0 members — refusing to write an empty ACF group`);
}

function listInner(t) {
  // unwrap NonNull → List → NonNull → Named; return the named type only if it was a list
  let node = t;
  if (node.kind === "NonNullType") node = node.type;
  if (node.kind !== "ListType") return null;
  let el = node.type;
  if (el.kind === "NonNullType") el = el.type;
  return el.kind === "NamedType" ? el.name.value : null;
}
function namedType(t) {
  let node = t;
  if (node.kind === "NonNullType") node = node.type;
  return node.kind === "NamedType" ? node.name.value : null;
}
// Split on EVERY capital (faqItems→faq_items, CardGrid→card_grid); leading "_" stripped so
// type stems (uppercase-first) and field names (lowercase-first) both round-trip.
const snake = (s) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`).replace(/^_/, "");
const title = (s) => snake(s).split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
const layoutName = (typeName) => snake(typeName.slice(BLOCK_PREFIX.length).replace(/Layout$/, ""));

// Build ACF sub_fields for a type. `keyBase` namespaces scalar field keys; repeaters root
// their own key at field_pod_<uniqueName> (the 2.x repeater field name is already unique).
function subFields(typeDef, keyBase) {
  const out = [];
  for (const f of typeDef.fields) {
    const acfName = snake(f.name.value);
    const named = namedType(f.type);
    const inner = listInner(f.type);
    if (inner && objects.has(inner)) {
      const key = `field_pod_${acfName}`;
      out.push({
        key,
        name: acfName,
        label: title(acfName),
        type: "repeater",
        layout: "block",
        button_label: `Add ${title(acfName)}`,
        sub_fields: subFields(objects.get(inner), key),
      });
    } else if (named === IMAGE_EDGE) {
      out.push({ key: `${keyBase}_${acfName}`, name: acfName, label: title(acfName), type: "image", return_format: "id", preview_size: "medium" });
    } else if (named === "Int" || named === "Float") {
      out.push({ key: `${keyBase}_${acfName}`, name: acfName, label: title(acfName), type: "number" });
    } else if (named === "Boolean") {
      out.push({ key: `${keyBase}_${acfName}`, name: acfName, label: title(acfName), type: "true_false", ui: 1 });
    } else {
      // String (and anything else scalar) → text; wrapper fields (tone/spacing/...) are String too
      out.push({ key: `${keyBase}_${acfName}`, name: acfName, label: title(acfName), type: "text" });
    }
  }
  return out;
}

const layouts = {};
for (const typeName of [...layoutTypes].sort()) {
  const name = layoutName(typeName);
  const key = `layout_pod_${name}`;
  layouts[key] = {
    key,
    name,
    label: title(name),
    display: "block",
    sub_fields: subFields(objects.get(typeName), `field_pod_${name}`),
  };
}

const group = [
  {
    key: "group_pod_page_blocks",
    title: "Page Blocks",
    fields: [
      {
        key: "field_pod_blocks",
        name: "blocks",
        label: "Blocks",
        type: "flexible_content",
        button_label: "Add block",
        layouts,
      },
    ],
    location: [[{ param: "post_type", operator: "==", value: "page" }]],
    menu_order: 0,
    position: "normal",
    style: "default",
    active: true,
    show_in_graphql: 1,
    graphql_field_name: "pageFields",
    // map_graphql_types_from_location_rules left default; page location → exposed on Page type
  },
];

writeFileSync(join(root, "wp/acf-export.json"), `${JSON.stringify(group, null, 2)}\n`);
console.log(`Wrote wp/acf-export.json — ${Object.keys(layouts).length} layouts:`);
console.log(Object.values(layouts).map((l) => `  ${l.name} (${l.sub_fields.length} fields)`).join("\n"));
