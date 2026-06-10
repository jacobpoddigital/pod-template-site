# /project-input/ — the handoff package

The HQ pipeline (web-ai-automation `workflow/27`) drops this client's spec here at the start of a
build. **Claude Code reads everything in this folder before touching code** (see `/AGENTS.md`).

| File | Source | What it is |
|---|---|---|
| `BUILD-SPEC.md` | the handoff agent (synthesised from the locked facts + brief) | the build contract: goal, exact brand (fonts/hex), pages + §6 block inventory, conversion, WP connection |
| `tokens.css` | the design_system run's theme | the shadcn-bridge `:root` — **copy into `src/styles/theme.css`** (drops in, ADR 0012) |
| `wireframe.html` | the wireframe run | the lo-fi layout reference (section order per page) |

The brand values in `BUILD-SPEC.md` are **locked decisions** — use the fonts and hex EXACTLY.

This folder is committed empty (this README) in the template; per client, the package lands here.
Nothing in here is shipped to the live site — it's the builder's brief.
