#!/usr/bin/env bash
# PostToolUse audit logger — the "what changed, when" trail (workflow/06).
# Event shape: workflow/15 §1. Local JSONL always; hub sink when configured
# (see lib-sink.sh).
set -euo pipefail

# shellcheck disable=SC1091
source "$(dirname "${BASH_SOURCE[0]}")/lib-sink.sh"

INPUT=$(cat)

EVENT=$(printf '%s' "$INPUT" | jq -c '{
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
}')

emit_event "$EVENT"

exit 0
