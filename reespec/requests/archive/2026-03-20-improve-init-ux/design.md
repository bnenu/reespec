# Design — improve-init-ux

## Context

The current CLI is a bash script. Bash cannot do arrow-key navigation or real-time terminal rendering. openspec solves this with `@inquirer/core` — a low-level hook system for interactive terminal prompts. We reuse the same approach and copy their `searchable-multi-select` implementation directly (MIT licensed, exactly the right UX, already proven).

## Approach

### Runtime: Node.js ESM, single file

`bin/reespec.mjs` with shebang `#!/usr/bin/env node`. No build step. Node.js 18+ assumed.

### Repo structure after this request

```
bin/
  reespec.mjs                        ← Node.js CLI (replaces bash reespec)
  reespec.sh                         ← bash script kept temporarily, removed after verify
  prompts/
    searchable-multi-select.mjs      ← ported from openspec (MIT)
skills/
  reespec-discover/SKILL.md          ← canonical skill sources (moved from .pi/skills/)
  reespec-plan/SKILL.md
  reespec-execute/SKILL.md
  reespec-archive/SKILL.md
package.json                         ← dev dependencies: @inquirer/core, chalk
node_modules/                        ← gitignored
```

### Skill resolution

Skills resolved relative to `import.meta.url` — reliable across PATH installs and symlinks:

```js
const SKILLS_SRC = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../skills'
)
```

### Interactive init UX

```
  Which agent harnesses do you use?
  Selected: [ Pi ] [ Claude Code ]
  Search: [type to filter          ]
  ↑↓ navigate • Space toggle • Enter confirm

  › ◉ Pi              (selected)
    ○ OpenCode
    ◉ Claude Code     (selected)
    ○ Cursor
    ○ Windsurf
    ○ Cline
    ○ RooCode
```

### Harness config

Same 7 harnesses as bash version. Each entry carries: key, display name, skills dir, commands dir.

### Non-interactive flag

`--tools pi,opencode` or `--tools all` bypasses the prompt entirely — identical behaviour to bash version.

## Decisions

### Copy openspec's searchable-multi-select verbatim
It's MIT, exactly right, already proven in production. Inlined as a local module to avoid a runtime dependency on openspec itself.

### No build step
Plain ESM `.mjs` files. Node resolves imports from `node_modules/` in repo root. Simple to read and edit.

### Keep bash script temporarily
Renamed to `bin/reespec.sh` during transition. Removed once Node.js version is verified working end-to-end.

## Risks

- **Node.js not installed**: target audience is developers, rare. Error is self-explanatory.
- **`npm install` required locally**: documented in README for contributors. End users won't need this once npm package is published (separate request).
