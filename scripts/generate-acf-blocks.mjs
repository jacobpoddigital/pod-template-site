// Generate wp/acf-export.json (the page-blocks ACF flexible-content group) from the
// committed block contract in src/lib/cms/schema.graphql. This is the WP-side half of the
// block system that the frontend (query/schema/adapter/components) already declares —
// "per-client ACF generated at provision time" (workflow/29, HQ FRICTION #70). Keeping it
// generated guarantees WP-ACF and the frontend never drift.
//
// Mapping: String→text · Int→number · Boolean→true_false · MediaItem→image (edge in 2.x) ·
// [BlockSubType!]→repeater (recursive). Repeater names are LAYOUT-PREFIXED + unique because
// wpgraphql-acf 2.x derives a GENERIC type per repeater field NAME (faq `items` + usp `items`
// would collide → PageFieldsBlocksItems) — unique names give each its own type (HQ FRICTION #97).
//
// Run: node scripts/generate-acf-blocks.mjs  → writes wp/acf-export.json
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse } from "graphql";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sdl = readFileSync(join(root, "src/lib/cms/schema.graphql"), "utf8");
const ast = parse(sdl);

const PREFIX = "Page_Pagefields_Blocks_";
const objects = new Map();
for (const def of ast.definitions) {
  if (def.kind === "ObjectTypeDefinition" && def.name.value.startsWith(PREFIX)) {
    objects.set(def.name.value, def);
  }
}

// A block type is a LAYOUT unless it's referenced as the element of a list field (a repeater
// sub-type). Compute referenced sub-types; layouts = blockTypes − referenced.
const referenced = new Set();
for (const def of objects.values()) {
  for (const f of def.fields) {
    const inner = listInner(f.type);
    if (inner && objects.has(inner)) referenced.add(inner);
  }
}
const layoutTypes = [...objects.keys()].filter((n) => !referenced.has(n));

function listInner(t) {
  // unwrap NonNull → List → NonNull → Named, return the named type if it was a list
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
// Split on EVERY capital (so optionALabel→option_a_label, matching the zod field names);
// wpgraphql-acf re-camelCases the ACF name back to the original, so the round-trip holds.
const snake = (s) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const title = (s) => snake(s).split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
const layoutName = (typeName) => snake(typeName.slice(PREFIX.length)).replace(/^_/, ""); // Hero→hero, CardGrid→card_grid

// Build ACF sub_fields for a type's fields. `keyBase` namespaces field keys; `namePrefix`
// makes repeater NAMES unique across the whole group (collision rule above).
function subFields(typeDef, keyBase, namePrefix) {
  const out = [];
  for (const f of typeDef.fields) {
    const gqlName = f.name.value; // camelCase as declared in the SDL
    const acfName = snake(gqlName); // wpgraphql-acf re-camelCases back to gqlName
    const fk = `${keyBase}_${acfName}`;
    const named = namedType(f.type);
    const inner = listInner(f.type);
    if (inner && objects.has(inner)) {
      // repeater — unique name = namePrefix + field, so its generic 2.x type is unique
      const repName = `${namePrefix}_${acfName}`;
      out.push({
        key: `field_pod_${repName}`,
        name: repName,
        label: title(acfName),
        type: "repeater",
        layout: "block",
        button_label: `Add ${title(acfName)}`,
        sub_fields: subFields(objects.get(inner), `field_pod_${repName}`, repName),
      });
    } else if (named === "MediaItem") {
      out.push({ key: fk, name: acfName, label: title(acfName), type: "image", return_format: "id", preview_size: "medium" });
    } else if (named === "Int") {
      out.push({ key: fk, name: acfName, label: title(acfName), type: "number" });
    } else if (named === "Boolean") {
      out.push({ key: fk, name: acfName, label: title(acfName), type: "true_false", ui: 1 });
    } else {
      // String (and anything else scalar) → text; wrapper fields (tone/spacing/...) are String too
      out.push({ key: fk, name: acfName, label: title(acfName), type: "text" });
    }
  }
  return out;
}

const layouts = {};
for (const typeName of layoutTypes.sort()) {
  const name = layoutName(typeName);
  const key = `layout_pod_${name}`;
  layouts[key] = {
    key,
    name,
    label: title(name),
    display: "block",
    sub_fields: subFields(objects.get(typeName), `field_pod_${name}`, name),
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
