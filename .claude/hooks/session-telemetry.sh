#!/usr/bin/env bash
# SessionStart/SessionEnd telemetry — emits session.started / session.ended
# events (workflow/15 registry). Local JSONL always; hub sink when configured
# (see lib-sink.sh).
set -euo pipefail

EVENT_TYPE="${1:?usage: session-telemetry.sh session.started|session.ended}"

# shellcheck disable=SC1091
source "$(dirname "${BASH_SOURCE[0]}")/lib-sink.sh"

INPUT=$(cat)

EVENT=$(printf '%s' "$INPUT" | jq -c --arg et "$EVENT_TYPE" '{
  ts: (now | todate),
  project_id: (env.POD_PROJECT_ID // "unset"),
  actor: "agent",
  event_type: $et,
  payload: {
    session_id: (.session_id // null),
    cwd: (.cwd // null)
  },
  trace_id: (.session_id // null)
}')

emit_event "$EVENT"

exit 0
