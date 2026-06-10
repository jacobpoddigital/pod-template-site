import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

// Layer boundaries (workflow/02) — inlined from HQ @pod/config boundaries-site.mjs
// (template-repo strategy; Phase 2 extracts this back into a shared package).
//   ui/      → imports nothing internal
//   blocks/  → may import ui, lib
//   layout/  → may import ui, lib
//   app/     → thin composition: blocks, layout, ui, lib/cms public API
//   lib/cms/ → the ONLY module that knows WordPress shapes
const podSiteBoundaries = {
  files: ["src/**/*.{ts,tsx}"],
  plugins: { boundaries },
  settings: {
    "import/resolver": { typescript: { project: "./tsconfig.json" } },
    // mode "full" + first-match-wins ordering: cms-public before cms-internal before lib.
    // (HQ's original `src/<layer>/*` folder-mode patterns silently matched nothing for
    // flat files — found via negative test; feed back into @pod/config.)
    "boundaries/elements": [
      { type: "cms-public", pattern: "src/lib/cms/index.ts", mode: "full" },
      { type: "cms-internal", pattern: "src/lib/cms/**/*", mode: "full" },
      { type: "lib", pattern: "src/lib/**/*", mode: "full" },
      { type: "ui", pattern: "src/ui/**/*", mode: "full" },
      { type: "blocks", pattern: "src/blocks/**/*", mode: "full" },
      { type: "layout", pattern: "src/layout/**/*", mode: "full" },
      { type: "app", pattern: "src/app/**/*", mode: "full" },
    ],
  },
  rules: {
    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        rules: [
          // Same-layer imports are always fine; cross-layer only as listed.
          { from: "ui", allow: ["ui", "lib"] }, // shadcn primitives import cn from lib/utils (ADR 0012)
          { from: "blocks", allow: ["blocks", "ui", "lib", "cms-public"] },
          { from: "layout", allow: ["layout", "ui", "lib", "cms-public"] },
          { from: "app", allow: ["app", "blocks", "layout", "ui", "lib", "cms-public"] },
          // Only the cms public API may touch WordPress shapes:
          { from: "cms-public", allow: ["cms-internal", "lib"] },
          { from: "cms-internal", allow: ["cms-internal", "lib"] },
          { from: "lib", allow: ["lib"] },
        ],
      },
    ],
  },
};

// Day-one size/complexity guardrails (workflow/02) — agents cannot merge violations.
const podGuardrails = {
  files: ["src/**/*.{ts,tsx}"],
  rules: {
    "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
    "max-lines-per-function": ["warn", { max: 60, skipBlankLines: true, skipComments: true }],
    complexity: ["error", 10],
    "max-params": ["error", 4],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  podSiteBoundaries,
  podGuardrails,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
