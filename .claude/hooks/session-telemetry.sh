#!/usr/bin/env bash
# SessionStart/SessionEnd telemetry — emits session.started / session.ended
# events (workflow/15 registry, Phase 2). Same shape and sink as the
# PostToolUse audit hook; Phase 3 swaps SINK to the hub URL, nothing else.
set -euo pipefail

EVENT_TYPE="${1:?usage: session-telemetry.sh session.started|session.ended}"

INPUT=$(cat)
AUDIT_DIR="$CLAUDE_PROJECT_DIR/.claude/audit"   # gitignored
SINK="$AUDIT_DIR/log.jsonl"
mkdir -p "$AUDIT_DIR"

printf '%s' "$INPUT" | jq -c --arg et "$EVENT_TYPE" '{
  ts: (now | todate),
  project_id: (env.POD_PROJECT_ID // "unset"),
  actor: "agent",
  event_type: $et,
  payload: {
    session_id: (.session_id // null),
    cwd: (.cwd // null)
  },
  trace_id: (.session_id // null)
}' >> "$SINK"

exit 0
