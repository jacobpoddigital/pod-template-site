#!/usr/bin/env bash
# PostToolUse output redaction (workflow/10) — strips secret-shaped strings from Bash output
# before it is persisted to the session transcript / re-enters context. Defence-in-depth:
# the primary control is that real secret VALUES are never on disk (injected via `doppler run`).
#
# Wire as a PostToolUse hook on Bash. Emits the redacted tool output back to Claude.
set -euo pipefail

INPUT=$(cat)
OUT=$(printf '%s' "$INPUT" | jq -r '.tool_response.stdout // .tool_response // empty' 2>/dev/null || true)

[ -z "$OUT" ] && exit 0

REDACTED=$(printf '%s' "$OUT" | sed -E \
  -e 's/sk-[A-Za-z0-9_-]{16,}/sk-***REDACTED***/g' \
  -e 's/(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}/gh*_***REDACTED***/g' \
  -e 's/github_pat_[A-Za-z0-9_]{20,}/github_pat_***REDACTED***/g' \
  -e 's/dppr_[A-Za-z0-9]{20,}/dppr_***REDACTED***/g' \
  -e 's/xox[baprs]-[A-Za-z0-9-]{10,}/xox*-***REDACTED***/g' \
  -e 's/AKIA[0-9A-Z]{16}/AKIA***REDACTED***/g')

# Only override output if we actually redacted something.
if [ "$REDACTED" != "$OUT" ]; then
  jq -n --arg ctx "$REDACTED" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: ("[output redacted by secrets hook]\n" + $ctx)}}'
fi

exit 0
