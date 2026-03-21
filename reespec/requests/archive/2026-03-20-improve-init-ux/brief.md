# Brief — improve-init-ux

## Why

The current `reespec init` interactive mode uses a plain numbered-list prompt read via bash `read`. This is functional but subpar compared to openspec's UX, which offers arrow-key navigation, space-to-toggle multiselect, type-to-filter search, and visual chips showing current selections. Bash cannot deliver this — the CLI needs to be rewritten in Node.js.

## What Changes

- Rewrite `bin/reespec` from bash to Node.js (`bin/reespec.mjs`)
- `reespec init` interactive harness selection uses a searchable multi-select: arrow keys to navigate, space to toggle, type to filter, Enter to confirm, chips showing selections
- All existing commands preserved with identical behaviour
- `--tools` non-interactive flag continues to work unchanged
- Skill source files resolved from `skills/` directory in repo root (canonical location, not `.pi/skills/`)

## Goals

- Match openspec's interactive init UX quality
- Arrow key navigation, space to toggle, type-to-filter, chip display
- No regression on any existing command behaviour
- Single Node.js file, no build step

## Non-Goals

- npm publishing (separate request)
- Repo restructure beyond moving skill source to `skills/` (separate request)
- Changing any skill content
- Changing the reespec data directory structure

## Impact

- `bin/reespec` bash script replaced by `bin/reespec.mjs`
- `bin/prompts/searchable-multi-select.mjs` added
- `package.json` added for local dev dependency management
- Skill resolution path updated to `skills/` at repo root
