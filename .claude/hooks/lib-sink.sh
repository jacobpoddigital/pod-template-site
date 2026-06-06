#!/usr/bin/env bash
# Shared event emission — sourced by post-tool-audit.sh and session-telemetry.sh.
#
# Contract (workflow/15 §4 + hub DESIGN.md §resilience):
#   1. ALWAYS append to local JSONL — the durable record; importer reconciles.
#   2. If ~/.pod/hub-sink.env defines POD_HUB_URL + POD_HUB_TOKEN, ALSO POST to
#      the hub — fire-and-forget, 2s cap, backgrounded, never blocks or fails
#      the session. Hub down = nothing happens, by design.
#
# The env file lives OUTSIDE all repos (machine-level config, never committed):
#   ~/.pod/hub-sink.env:  POD_HUB_URL=http://localhost:8787
#                         POD_HUB_TOKEN=…

emit_event() {
  local event="$1"
  local audit_dir="$CLAUDE_PROJECT_DIR/.claude/audit"   # gitignored
  mkdir -p "$audit_dir"
  printf '%s\n' "$event" >> "$audit_dir/log.jsonl"

  local hub_env="$HOME/.pod/hub-sink.env"
  if [[ -f "$hub_env" ]]; then
    # shellcheck disable=SC1090
    source "$hub_env"
    if [[ -n "${POD_HUB_URL:-}" && -n "${POD_HUB_TOKEN:-}" ]]; then
      (curl -s --max-time 2 -X POST "$POD_HUB_URL/api/events" \
        -H "Authorization: Bearer $POD_HUB_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$event" >/dev/null 2>&1 || true) &
    fi
  fi
}
