#!/usr/bin/env bash
# reespec — human-agent collaboration framework CLI
# Usage: reespec <command> [options]

set -uo pipefail

REESPEC_DIR="reespec"
REQUESTS_DIR="$REESPEC_DIR/requests"
ARCHIVE_DIR="$REQUESTS_DIR/archive"
DECISIONS_FILE="$REESPEC_DIR/decisions.md"

# resolve the directory where this script lives (for finding bundled skills)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SRC="$(cd "$SCRIPT_DIR/../.pi/skills" && pwd)"

# ── harness config ────────────────────────────────────────────────────────────
# Each entry: "name|display_name|skills_dir|commands_dir"
# skills_dir:   where SKILL.md files go
# commands_dir: where slash-command prompt files go (empty = skip)

declare -a HARNESSES=(
  "pi|Pi|.pi/skills|.pi/prompts"
  "opencode|OpenCode|.opencode/skills|.opencode/command"
  "claude|Claude Code|.claude/skills|.claude/commands/reespec"
  "cursor|Cursor|.cursor/skills|.cursor/commands"
  "windsurf|Windsurf|.windsurf/skills|.windsurf/workflows"
  "cline|Cline|.cline/skills|.clinerules/workflows"
  "roocode|RooCode|.roo/skills|.roo/commands"
)

# skill names to install
SKILL_NAMES=(reespec-discover reespec-plan reespec-execute reespec-archive)

# ── helpers ───────────────────────────────────────────────────────────────────

die() { echo "error: $*" >&2; exit 1; }

require_request_name() {
  [[ -n "${1:-}" ]] || die "request name required"
  echo "$1"
}

request_exists() {
  [[ -d "$REQUESTS_DIR/$1" ]]
}

artifact_status() {
  local req="$1"
  local base="$REQUESTS_DIR/$req"
  local status=""
  for f in brief.md design.md tasks.md; do
    if [[ -f "$base/$f" ]] && [[ -s "$base/$f" ]]; then
      status="$status ✓$f"
    else
      status="$status ✗$f"
    fi
  done
  if [[ -d "$base/specs" ]] && [[ -n "$(ls -A "$base/specs" 2>/dev/null)" ]]; then
    status="$status ✓specs/"
  else
    status="$status ✗specs/"
  fi
  echo "$status"
}

harness_by_key() {
  local key="$1"
  for h in "${HARNESSES[@]}"; do
    local hkey="${h%%|*}"
    [[ "$hkey" == "$key" ]] && { echo "$h"; return 0; }
  done
  return 1
}

# install skills for one harness entry
install_harness() {
  local entry="$1"
  IFS='|' read -r hkey display skills_dir commands_dir <<< "$entry"

  mkdir -p "$skills_dir"
  local installed=0

  for skill in "${SKILL_NAMES[@]}"; do
    local src="$SKILLS_SRC/$skill/SKILL.md"
    if [[ -f "$src" ]]; then
      mkdir -p "$skills_dir/$skill"
      cp "$src" "$skills_dir/$skill/SKILL.md"
      installed=$((installed + 1))
    else
      echo "  warning: skill source not found: $src"
    fi
  done

  # install slash-command prompt files
  if [[ -n "$commands_dir" ]]; then
    mkdir -p "$commands_dir"
    for skill in "${SKILL_NAMES[@]}"; do
      local src="$SKILLS_SRC/$skill/SKILL.md"
      [[ -f "$src" ]] || continue
      # derive short command name: reespec-discover → discover
      local cmd="${skill#reespec-}"
      local dest="$commands_dir/reespec-${cmd}.md"
      # extract description from SKILL.md frontmatter
      local desc
      desc=$(grep '^description:' "$src" | head -1 | sed 's/^description: *//' | tr -d '"')
      {
        echo "---"
        echo "description: \"$desc\""
        echo "---"
        echo ""
        # inline the skill content (skip the frontmatter block)
        awk '/^---/{found++; if(found==2){skip=0; next} else {skip=1; next}} !skip' "$src"
      } > "$dest"
    done
  fi

  echo "  ✓ $display — $installed skills → $skills_dir"
}

# ── commands ──────────────────────────────────────────────────────────────────

cmd_init() {
  local tools_flag=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --tools) tools_flag="${2:-}"; shift 2 ;;
      *) die "unknown option: $1" ;;
    esac
  done

  # ── 1. scaffold reespec data directory ──
  mkdir -p "$REQUESTS_DIR" "$ARCHIVE_DIR"

  if [[ ! -f "$DECISIONS_FILE" ]]; then
    cat > "$DECISIONS_FILE" << 'EOF'
# Decisions

Architectural and strategic decisions across all requests.
One decision per entry. One paragraph. Reference the request for details.

## Entry format

### <Decision title> — YYYY-MM-DD (Request: <request-name>)

What was decided and why. What was considered and rejected.
See request artifacts for full context.

---

## What belongs here
- Library or technology choices with rationale
- Architectural patterns adopted
- Approaches explicitly rejected and why
- Deviations from the original plan with explanation
- Decisions that constrain future work

## What does NOT belong here
- Activity entries ("added X", "removed Y", "refactored Z")
- Implementation details available in request artifacts
- Decisions too small to affect future planning

---

<!-- decisions below this line -->
EOF
    echo "created $DECISIONS_FILE"
  else
    echo "$DECISIONS_FILE already exists, skipping"
  fi

  # ── 2. select harnesses ──
  local selected_keys=()

  if [[ -n "$tools_flag" ]]; then
    # non-interactive: --tools pi,opencode or --tools all
    if [[ "$tools_flag" == "all" ]]; then
      for h in "${HARNESSES[@]}"; do
        selected_keys+=("${h%%|*}")
      done
    else
      IFS=',' read -ra selected_keys <<< "$tools_flag"
    fi
  else
    # interactive: show menu, let user pick
    echo ""
    echo "Which agent harnesses do you use? (select all that apply)"
    echo ""
    local i=1
    for h in "${HARNESSES[@]}"; do
      IFS='|' read -r hkey display _ _ <<< "$h"
      echo "  $i) $display  ($hkey)"
      i=$((i + 1))
    done
    echo ""
    echo "Enter numbers separated by spaces, or 'all':"
    read -r -p "> " selection

    if [[ "$selection" == "all" ]]; then
      for h in "${HARNESSES[@]}"; do
        selected_keys+=("${h%%|*}")
      done
    else
      for num in $selection; do
        local idx=$((num - 1))
        if [[ $idx -ge 0 ]] && [[ $idx -lt ${#HARNESSES[@]} ]]; then
          selected_keys+=("${HARNESSES[$idx]%%|*}")
        else
          echo "  warning: invalid selection '$num', skipping"
        fi
      done
    fi
  fi

  # ── 3. install skills for each selected harness ──
  if [[ ${#selected_keys[@]} -eq 0 ]]; then
    echo ""
    echo "No harnesses selected. Skills not installed."
    echo "Run 'reespec install --tools <harness>' to install later."
  else
    echo ""
    echo "Installing skills..."
    for key in "${selected_keys[@]}"; do
      local entry
      entry=$(harness_by_key "$key") || { echo "  warning: unknown harness '$key', skipping"; continue; }
      install_harness "$entry"
    done
  fi

  echo ""
  echo "reespec initialized at ./$REESPEC_DIR"
  echo ""
  echo "Getting started:"
  echo "  Ask your agent to use the reespec-discover skill"
  echo "  Or: reespec new request \"your idea\""
}

cmd_install() {
  # install skills into harnesses without re-initialising data dir
  local tools_flag=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --tools) tools_flag="${2:-}"; shift 2 ;;
      *) die "usage: reespec install --tools <harness[,harness]|all>" ;;
    esac
  done

  [[ -n "$tools_flag" ]] || die "usage: reespec install --tools <harness[,harness]|all>"

  local selected_keys=()
  if [[ "$tools_flag" == "all" ]]; then
    for h in "${HARNESSES[@]}"; do selected_keys+=("${h%%|*}"); done
  else
    IFS=',' read -ra selected_keys <<< "$tools_flag"
  fi

  echo "Installing skills..."
  for key in "${selected_keys[@]}"; do
    local entry
    entry=$(harness_by_key "$key") || { echo "  warning: unknown harness '$key', skipping"; continue; }
    install_harness "$entry"
  done
  echo "Done. Restart your IDE for slash commands to take effect."
}

cmd_new() {
  [[ "${1:-}" == "request" ]] || die "usage: reespec new request <name>"
  local name
  name=$(require_request_name "${2:-}")
  local base="$REQUESTS_DIR/$name"

  request_exists "$name" && die "request '$name' already exists at $base"

  mkdir -p "$base/specs"

  cat > "$base/brief.md" << EOF
# Brief — $name

## Why

<!-- What problem does this solve? What is the motivation? -->

## What Changes

<!-- What will be different after this request is complete? -->

## Goals

<!-- What outcomes are we aiming for? -->

## Non-Goals

<!-- What is explicitly out of scope? -->

## Impact

<!-- What systems, people, or workflows are affected? -->
EOF

  cat > "$base/design.md" << EOF
# Design — $name

## Context

<!-- Background needed to understand the design decisions. -->

## Approach

<!-- How will this be implemented? Key decisions and tradeoffs. -->

## Risks

<!-- What could go wrong? What are the tradeoffs? -->
EOF

  cat > "$base/tasks.md" << EOF
# Tasks — $name

<!-- Each task must follow the RED/ACTION/GREEN format:
     RED:    assertion that currently fails (failing test or observable check)
     ACTION: what the agent will do
     GREEN:  verify the assertion now passes
-->
EOF

  echo "created request '$name' at $base"
  echo "artifacts: brief.md, design.md, specs/, tasks.md"
}

cmd_list() {
  if [[ ! -d "$REQUESTS_DIR" ]]; then
    echo "no requests found — run 'reespec init' first"
    exit 0
  fi

  local found=0
  for req_dir in "$REQUESTS_DIR"/*/; do
    [[ -d "$req_dir" ]] || continue
    local req
    req=$(basename "$req_dir")
    [[ "$req" == "archive" ]] && continue
    echo "$req $(artifact_status "$req")"
    found=1
  done

  if [[ $found -eq 0 ]]; then
    echo "no active requests — run 'reespec new request <name>' to create one"
  fi
}

cmd_status() {
  local request_name=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --request) request_name="${2:-}"; shift 2 ;;
      *) die "unknown option: $1" ;;
    esac
  done

  [[ -n "$request_name" ]] || die "usage: reespec status --request <name>"
  request_exists "$request_name" || die "request '$request_name' not found"

  local base="$REQUESTS_DIR/$request_name"
  echo "request: $request_name"
  echo ""

  for f in brief.md design.md tasks.md; do
    if [[ -f "$base/$f" ]] && [[ -s "$base/$f" ]]; then
      local lines
      lines=$(wc -l < "$base/$f" | tr -d ' ')
      echo "  ✓ $f ($lines lines)"
    else
      echo "  ✗ $f (missing or empty)"
    fi
  done

  if [[ -d "$base/specs" ]]; then
    local spec_count
    spec_count=$(find "$base/specs" -name "spec.md" | wc -l | tr -d ' ')
    if [[ "$spec_count" -gt 0 ]]; then
      echo "  ✓ specs/ ($spec_count spec files)"
    else
      echo "  ✗ specs/ (empty)"
    fi
  else
    echo "  ✗ specs/ (missing)"
  fi

  echo ""

  if [[ -f "$base/tasks.md" ]]; then
    local total done_count
    total=$(grep -c '^\- \[' "$base/tasks.md" 2>/dev/null || true)
    done_count=$(grep -c '^\- \[x\]' "$base/tasks.md" 2>/dev/null || true)
    total=${total:-0}
    done_count=${done_count:-0}
    echo "  tasks: $done_count/$total complete"
  fi
}

cmd_archive() {
  local request_name=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --request) request_name="${2:-}"; shift 2 ;;
      *) die "unknown option: $1" ;;
    esac
  done

  [[ -n "$request_name" ]] || die "usage: reespec archive --request <name>"
  request_exists "$request_name" || die "request '$request_name' not found"

  mkdir -p "$ARCHIVE_DIR"

  local date_prefix
  date_prefix=$(date +%Y-%m-%d)
  local target="$ARCHIVE_DIR/$date_prefix-$request_name"

  [[ -d "$target" ]] && die "archive target already exists: $target"

  local base="$REQUESTS_DIR/$request_name"
  if [[ -f "$base/tasks.md" ]]; then
    local incomplete
    incomplete=$(grep -c '^\- \[ \]' "$base/tasks.md" 2>/dev/null || true)
    incomplete=${incomplete:-0}
    if [[ "$incomplete" -gt 0 ]]; then
      echo "warning: $incomplete incomplete task(s) in tasks.md"
      read -r -p "archive anyway? [y/N] " confirm
      [[ "$confirm" =~ ^[yY]$ ]] || { echo "archive cancelled"; exit 0; }
    fi
  fi

  mv "$REQUESTS_DIR/$request_name" "$target"
  echo "archived: $request_name → $target"
}

cmd_harnesses() {
  echo "Supported agent harnesses:"
  echo ""
  for h in "${HARNESSES[@]}"; do
    IFS='|' read -r hkey display skills_dir _ <<< "$h"
    printf "  %-12s %s  (skills → %s)\n" "$hkey" "$display" "$skills_dir"
  done
  echo ""
  echo "Usage: reespec init --tools pi,opencode"
  echo "       reespec install --tools all"
}

# ── dispatch ──────────────────────────────────────────────────────────────────

COMMAND="${1:-}"
shift || true

case "$COMMAND" in
  init)      cmd_init "$@" ;;
  install)   cmd_install "$@" ;;
  new)       cmd_new "$@" ;;
  list)      cmd_list ;;
  status)    cmd_status "$@" ;;
  archive)   cmd_archive "$@" ;;
  harnesses) cmd_harnesses ;;
  "")
    echo "reespec — human-agent collaboration framework"
    echo ""
    echo "Usage: reespec <command> [options]"
    echo ""
    echo "Commands:"
    echo "  init [--tools <harnesses>]       initialise reespec + install skills"
    echo "  install --tools <harnesses>      install skills into agent harnesses"
    echo "  new request <name>               scaffold a new request"
    echo "  list                             list active requests"
    echo "  status --request <name>          show artifact status"
    echo "  archive --request <name>         archive a completed request"
    echo "  harnesses                        list supported agent harnesses"
    echo ""
    echo "Examples:"
    echo "  reespec init                     interactive harness selection"
    echo "  reespec init --tools pi,opencode non-interactive"
    echo "  reespec install --tools all      install to all harnesses"
    exit 1
    ;;
  *) die "unknown command: $COMMAND" ;;
esac
