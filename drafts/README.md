# `drafts/` — upstream workspace (not the build's input)

The working area for the **upstream stages** that run *before* the build: `brief/`, `wireframe/`, `content/`. These produce the artifacts that get synthesised into the **`/project-input/`** handoff.

> **The one distinction that matters (for humans *and* Claude builders):**
> - **`/project-input/`** = **what the build reads.** Claude Code reads this before touching code (`AGENTS.md`). The build contract lives here.
> - **`drafts/`** = **where upstream work is drafted** (brief → wireframe → copy). Run in-repo today (HQ `workflow/01`) or delivered by the Hub pipeline (the target, HQ `workflow/27`). The build does **not** read `drafts/` directly.

| Subfolder | Stage | Produces |
|---|---|---|
| `brief/` | the structured client brief (`brief.md`) + the 11-section `brief-template.md` | feeds `project-input/BUILD-SPEC.md` |
| `wireframe/` | the lo-fi `wireframe.html` + review records | feeds `project-input/wireframe.html` |
| `content/` | copy passes (`copy-NN.md`) | feeds the WP seed + `site.config.ts` |
