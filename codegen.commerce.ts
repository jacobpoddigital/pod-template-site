import type { CodegenConfig } from "@graphql-codegen/cli";

// Commerce module codegen (opt-in bolt-on). ISOLATED from the curated cms codegen:
// its own schema (the full live WooGraphQL SDL) + its own generated/ output, so adding
// WooCommerce's large schema never touches or breaks src/lib/cms. Regenerate the SDL
// per project from live WP (WooGraphQL adds ~42k lines):
//   pnpm dlx get-graphql-schema "$WPGRAPHQL_URL" > src/lib/commerce/schema.graphql
// then `pnpm codegen:commerce` and commit both. (Reads only — cart/checkout WRITES go
// through the Store API + Cart-Token, not GraphQL — workflow/14.)
const config: CodegenConfig = {
  schema: "./src/lib/commerce/schema.graphql",
  documents: ["src/lib/commerce/queries/**/*.graphql"],
  ignoreNoDocuments: true,
  generates: {
    "src/lib/commerce/generated/": {
      preset: "client",
      presetConfig: { fragmentMasking: false },
      config: { useTypeImports: true },
    },
  },
};

export default config;
