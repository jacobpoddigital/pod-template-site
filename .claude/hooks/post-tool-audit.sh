#!/usr/bin/env bash
# PostToolUse audit logger — the "what changed, when" trail (workflow/06).
# Payload shape mirrors the hub events schema (workflow/03):
#   { ts, project_id, actor, event_type, payload, trace_id }
# Phase 2: appends to local JSONL. Phase 3: switch SINK to the hub URL — same shape, zero changes.
set -euo pipefail

INPUT=$(cat)
AUDIT_DIR="$CLAUDE_PROJECT_DIR/.claude/audit"   # gitignored
SINK="$AUDIT_DIR/log.jsonl"
mkdir -p "$AUDIT_DIR"

printf '%s' "$INPUT" | jq -c '{
  ts: (now | todate),
  project_id: (env.POD_PROJECT_ID // "unset"),
  actor: "agent",
  event_type: ("tool." + (.tool_name // "unknown")),
  payload: {
    session_id: (.session_id // null),
    file: (.tool_input.file_path // null),
    command: (.tool_input.command // null)
  },
  trace_id: (.session_id // null)
}' >> "$SINK"

exit 0
