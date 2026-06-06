#!/usr/bin/env bash
# PreToolUse guard for Bash commands — 100% deterministic enforcement layer (workflow/06).
# Exit 2 = block, stderr is shown to Claude. Defence-in-depth alongside settings.json deny rules.
set -euo pipefail

INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty')

[ -z "$CMD" ] && exit 0

block() {
  echo "BLOCKED by agency policy (workflow/06): $1" >&2
  exit 2
}

case "$CMD" in
  *"push --force"*|*"push -f"*)            block "force-push is never allowed" ;;
  *"rm -rf /"*|*"rm -rf ~"*)               block "destructive recursive delete" ;;
  *"--dangerously-skip-permissions"*)      block "skip-permissions flag is banned on machines holding credentials" ;;
  *"wp db drop"*|*"wp db reset"*)          block "destructive WP-CLI database command" ;;
  *"DROP DATABASE"*|*"DROP TABLE"*)        block "destructive SQL" ;;
  *"git config --global"*)                 block "agents may not change global git config (workflow/09)" ;;
  *"git reset --hard origin/"*)            block "hard reset against remote branches (workflow/09: revert, never reset)" ;;
esac

# curl/wget piped to a shell
if printf '%s' "$CMD" | grep -qE '(curl|wget)[^|]*\|\s*(ba)?sh'; then
  block "piping downloads to a shell"
fi

# Reading secret files or dumping env — secrets must never enter agent context (workflow/10).
# Deny rules are unreliable (#24846); this hook is the real control.
if printf '%s' "$CMD" | grep -qE '(cat|less|more|head|tail|grep|rg|nl|xxd|od)\s+[^|]*\.(env|pem|key)'; then
  block "reading a secret file — values live in Doppler, reference by name (workflow/10)"
fi
if printf '%s' "$CMD" | grep -qE '(^|[^a-z])(printenv|env)(\s|$)' && ! printf '%s' "$CMD" | grep -qE 'doppler run'; then
  block "dumping environment — would leak secret values into the transcript (workflow/10)"
fi

exit 0
