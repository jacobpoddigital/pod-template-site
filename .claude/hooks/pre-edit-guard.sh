#!/usr/bin/env bash
# PreToolUse guard for Edit/Write — protects files agents must never modify (security research:
# .claude/, CI configs and lockfiles are supply-chain / persistence vectors).
set -euo pipefail

INPUT=$(cat)
FILE=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')

[ -z "$FILE" ] && exit 0

block() {
  echo "BLOCKED by agency policy (workflow/06): $1 — request a human to change this file" >&2
  exit 2
}

case "$FILE" in
  *".claude/settings.json"|*".claude/hooks/"*)  block "agents may not modify their own guardrails" ;;
  *".github/workflows/"*)                       block "agents may not modify CI workflows" ;;
  *".env"|*".env."*)                            block "agents may not write env/secret files" ;;
  *"wp-config.php")                             block "agents may not modify wp-config" ;;
esac

exit 0
