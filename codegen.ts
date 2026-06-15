import type { CodegenConfig } from "@graphql-codegen/cli";

// GraphQL Codegen (ADR 0007 / workflow/28). The schema is the contract — typed
// documents + types are generated from it; no hand-written Zod for CMS shapes.
//
// `schema` points at the COMMITTED local SDL (src/lib/cms/schema.graphql), so
// `pnpm codegen` runs with NO live WordPress (ADR 0013 — build green offline).
// Regenerate the SDL per project from real WP once ACF is defined:
//   pnpm dlx get-graphql-schema "$WPGRAPHQL_URL" > src/lib/cms/schema.graphql
// then re-run `pnpm codegen` and commit both files.
const config: CodegenConfig = {
  schema: "./src/lib/cms/schema.graphql",
  documents: ["src/lib/cms/queries/**/*.graphql"],
  ignoreNoDocuments: true,
  generates: {
    "src/lib/cms/generated/": {
      preset: "client",
      // fragmentMasking OFF: we read fields directly off the result (the adapter
      // does `node.image.sourceUrl`, the mock fixtures are plain literals) and
      // send the document via graphql-request — not the urql/apollo masking
      // workflow. Off = named fragments (docs/acf-queries.md) inline into each
      // operation's result type, so spreading `...MediaItemFields` stays type-safe.
      presetConfig: { fragmentMasking: false },
      config: { useTypeImports: true },
    },
  },
};

export default config;
