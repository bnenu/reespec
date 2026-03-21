# Tasks — improve-init-ux

## 1. Repo preparation

### 1.1 Move skill sources to /skills

RED:    `skills/` directory does not exist; skill sources only exist under `.pi/skills/reespec-*/`
ACTION: Create `skills/` at repo root; move `reespec-discover`, `reespec-plan`, `reespec-execute`, `reespec-archive` SKILL.md files there; keep `.pi/skills/` copies in place (they are the installed copies for this repo's own agent)
GREEN:  `skills/reespec-discover/SKILL.md`, `skills/reespec-plan/SKILL.md`, `skills/reespec-execute/SKILL.md`, `skills/reespec-archive/SKILL.md` all exist

### 1.2 Add package.json and .gitignore

RED:    No package.json; `npm install` fails; node_modules would be committed
ACTION: Create `package.json` with `name: "reespec"`, `type: "module"`, `bin: { reespec: "bin/reespec.mjs" }`, dependencies `@inquirer/core` and `chalk`; add `node_modules/` to `.gitignore`
GREEN:  `npm install` completes without error; `node_modules/@inquirer/core` and `node_modules/chalk` exist; `.gitignore` contains `node_modules`

---

## 2. Searchable multi-select prompt

### 2.1 Port searchable-multi-select from openspec

RED:    `bin/prompts/searchable-multi-select.mjs` does not exist
ACTION: Create `bin/prompts/` directory; port openspec's searchable-multi-select implementation to `bin/prompts/searchable-multi-select.mjs` — arrow navigation, space toggle, type-to-filter, chip display, Enter to confirm
GREEN:  `node -e "import('./bin/prompts/searchable-multi-select.mjs').then(m => console.log(typeof m.searchableMultiSelect))"` prints `function`

---

## 3. Node.js CLI

### 3.1 Write bin/reespec.mjs — core structure

RED:    `bin/reespec.mjs` does not exist; `node bin/reespec.mjs` fails
ACTION: Write `bin/reespec.mjs` with: shebang, ESM imports (path, fs, url, chalk), HARNESSES config (7 harnesses with key/display/skills-dir/commands-dir), SKILL_NAMES, helper functions (die, artifactStatus, requestExists, harnessById, installHarness, skills resolution via import.meta.url pointing to `../skills`)
GREEN:  `node bin/reespec.mjs` prints usage without error

### 3.2 Implement init with interactive multi-select

RED:    `node bin/reespec.mjs init` errors or falls back to plain prompt — no arrow-key navigation
ACTION: Implement `cmd_init` using `searchableMultiSelect` for harness selection when no `--tools` flag provided; `--tools` flag bypasses prompt; installs skills and command files for selected harnesses
GREEN:  `node bin/reespec.mjs init --tools pi,opencode` non-interactively installs skills to `.pi/skills/` and `.opencode/skills/`; running without `--tools` renders the interactive multi-select UI

### 3.3 Port all remaining commands

RED:    Commands `new`, `list`, `status`, `archive`, `install`, `harnesses` not implemented in Node.js CLI
ACTION: Port each command from bash to Node.js with identical interface and output
GREEN:  Each command matches bash behaviour:
        - `node bin/reespec.mjs new request "test-x"` → correct directory and artifact files
        - `node bin/reespec.mjs list` → lists active requests
        - `node bin/reespec.mjs status --request "test-x"` → correct artifact status output
        - `node bin/reespec.mjs archive --request "test-x"` → moves to dated archive path
        - `node bin/reespec.mjs harnesses` → lists all 7 harnesses

### 3.4 Replace bash script with Node.js CLI

RED:    Running `reespec` still invokes the bash script
ACTION: Rename `bin/reespec` to `bin/reespec.sh`; create new `bin/reespec` as a thin wrapper: `#!/usr/bin/env node` delegating to `reespec.mjs` — or symlink; `chmod +x bin/reespec.mjs`
GREEN:  `reespec` (no path) invokes Node.js CLI and prints usage; `reespec init --tools pi` installs skills correctly

---

## 4. Verification

### 4.1 End-to-end test in clean directory

RED:    No verification that full flow works with Node.js CLI in a fresh project
ACTION: In a temp directory: `reespec init --tools pi,claude`; verify `.pi/skills/reespec-*/SKILL.md` and `.claude/skills/reespec-*/SKILL.md` exist; `reespec new request "e2e-test"`; `reespec list`; `reespec status --request e2e-test`; `echo y | reespec archive --request e2e-test`
GREEN:  All steps complete without error; correct files at correct paths; archived request at `reespec/requests/archive/YYYY-MM-DD-e2e-test/`

### 4.2 Update README

RED:    README install section still describes bash PATH setup with no mention of Node.js
ACTION: Update README install section: add "Prerequisites: Node.js 18+", replace bash PATH instructions with `npm install -g reespec` placeholder (noting npm publish is pending) and local dev instructions
GREEN:  README contains "Node.js" and "npm install"
