# src/ui — framework primitives

- NO CMS knowledge, NO client-specific values, NO internal imports (lint-enforced).
- Semantic theme tokens only (`bg-brand`, `rounded-card`) — never raw palette values (ADR 0004).
- One component per file, props typed inline. If a primitive needs CMS data, it isn't a primitive — it's a block.
