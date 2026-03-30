#!/usr/bin/env node
/**
 * reespec — human-agent collaboration framework CLI
 * Usage: reespec <command> [options]
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { searchableMultiSelect } from './prompts/searchable-multi-select.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_SRC = path.join(__dirname, '../skills');

// ── reespec data paths (relative to cwd) ─────────────────────────────────────

const REESPEC_DIR   = 'reespec';
const REQUESTS_DIR  = `${REESPEC_DIR}/requests`;
const ARCHIVE_DIR   = `${REQUESTS_DIR}/archive`;
const DECISIONS_FILE = `${REESPEC_DIR}/decisions.md`;

// ── harness config ────────────────────────────────────────────────────────────
// { key, display, skillsDir, commandsDir }

const HARNESSES = [
  { key: 'pi',       display: 'Pi',          skillsDir: '.pi/skills',       commandsDir: '.pi/prompts'           },
  { key: 'opencode', display: 'OpenCode',    skillsDir: '.opencode/skills', commandsDir: '.opencode/command'     },
  { key: 'claude',   display: 'Claude Code', skillsDir: '.claude/skills',   commandsDir: '.claude/commands/reespec' },
  { key: 'cursor',   display: 'Cursor',      skillsDir: '.cursor/skills',   commandsDir: '.cursor/commands'      },
  { key: 'windsurf', display: 'Windsurf',    skillsDir: '.windsurf/skills', commandsDir: '.windsurf/workflows'   },
  { key: 'cline',    display: 'Cline',       skillsDir: '.cline/skills',    commandsDir: '.clinerules/workflows' },
  { key: 'roocode',  display: 'RooCode',     skillsDir: '.roo/skills',      commandsDir: '.roo/commands'         },
];

const SKILL_NAMES = [
  'reespec-discover',
  'reespec-plan',
  'reespec-execute',
  'reespec-evaluate',
  'reespec-archive',
];

// ── helpers ───────────────────────────────────────────────────────────────────

function die(msg) {
  console.error(chalk.red(`error: ${msg}`));
  process.exit(1);
}

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function exists(p) {
  return fs.existsSync(p);
}

function isNonEmpty(p) {
  try { return exists(p) && fs.statSync(p).size > 0; } catch { return false; }
}

function harnessById(key) {
  return HARNESSES.find(h => h.key === key);
}

function artifactStatus(reqName) {
  const base = path.join(REQUESTS_DIR, reqName);
  const parts = [];
  for (const f of ['brief.md', 'design.md', 'tasks.md']) {
    const p = path.join(base, f);
    parts.push(isNonEmpty(p) ? chalk.green(`✓${f}`) : chalk.red(`✗${f}`));
  }
  const specsDir = path.join(base, 'specs');
  const hasSpecs = exists(specsDir) &&
    fs.readdirSync(specsDir).some(e => fs.statSync(path.join(specsDir, e)).isDirectory());
  parts.push(hasSpecs ? chalk.green('✓specs/') : chalk.red('✗specs/'));
  return parts.join(' ');
}

function installHarness(harness) {
  mkdirp(harness.skillsDir);
  let installed = 0;

  for (const skill of SKILL_NAMES) {
    const src = path.join(SKILLS_SRC, skill, 'SKILL.md');
    if (!exists(src)) {
      console.warn(chalk.yellow(`  warning: skill source not found: ${src}`));
      continue;
    }
    const destDir = path.join(harness.skillsDir, skill);
    mkdirp(destDir);
    fs.copyFileSync(src, path.join(destDir, 'SKILL.md'));
    installed++;
  }

  // install slash-command prompt files
  if (harness.commandsDir) {
    mkdirp(harness.commandsDir);
    for (const skill of SKILL_NAMES) {
      const src = path.join(SKILLS_SRC, skill, 'SKILL.md');
      if (!exists(src)) continue;
      const cmd = skill.replace('reespec-', '');
      const dest = path.join(harness.commandsDir, `reespec-${cmd}.md`);
      const content = fs.readFileSync(src, 'utf8');
      // extract description from frontmatter
      const descMatch = content.match(/^description:\s*(.+)$/m);
      const desc = descMatch ? descMatch[1].replace(/^["']|["']$/g, '') : skill;
      // strip frontmatter block, prepend description-only frontmatter
      const body = content.replace(/^---[\s\S]*?---\n/, '');
      fs.writeFileSync(dest, `---\ndescription: "${desc}"\n---\n\n${body}`);
    }
  }

  console.log(`  ${chalk.green('✓')} ${harness.display} — ${installed} skills → ${harness.skillsDir}`);
}

// ── commands ──────────────────────────────────────────────────────────────────

function promptConfirm(question) {
  return new Promise(resolve => {
    process.stdout.write(question);
    const buf = Buffer.alloc(64);
    let input = '';
    try {
      const fd = fs.openSync('/dev/tty', 'r');
      let b;
      while ((b = fs.readSync(fd, buf, 0, 1, null)) > 0) {
        const c = buf.slice(0, b).toString();
        if (c === '\n') break;
        input += c;
      }
      fs.closeSync(fd);
    } catch {
      // non-interactive (piped input)
      const chunk = fs.readFileSync('/dev/stdin', 'utf8');
      input = chunk.trim();
    }
    resolve(input.trim().toLowerCase());
  });
}

async function cmdInit(args) {
  let toolsFlag = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tools') toolsFlag = args[++i] ?? '';
  }

  // 1. scaffold reespec data directory
  mkdirp(REQUESTS_DIR);
  mkdirp(ARCHIVE_DIR);

  if (!exists(DECISIONS_FILE)) {
    fs.writeFileSync(DECISIONS_FILE, `# Decisions

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
`);
    console.log(`created ${DECISIONS_FILE}`);
  } else {
    console.log(`${DECISIONS_FILE} already exists, skipping`);
  }

  // 2. select harnesses
  let selectedKeys = [];

  if (toolsFlag) {
    // non-interactive
    selectedKeys = toolsFlag === 'all'
      ? HARNESSES.map(h => h.key)
      : toolsFlag.split(',').map(s => s.trim());
  } else {
    // interactive — searchable multi-select
    console.log('');
    const choices = HARNESSES.map(h => ({
      name: h.display,
      value: h.key,
      preSelected: false,
    }));

    selectedKeys = await searchableMultiSelect({
      message: 'Which agent harnesses do you use?',
      choices,
      pageSize: HARNESSES.length,
      validate: sel => sel.length > 0 || 'Select at least one harness',
    });
    console.log('');
  }

  // 3. install skills
  if (selectedKeys.length === 0) {
    console.log('No harnesses selected. Skills not installed.');
    console.log("Run 'reespec install --tools <harness>' to install later.");
  } else {
    console.log('Installing skills...');
    for (const key of selectedKeys) {
      const harness = harnessById(key);
      if (!harness) {
        console.warn(chalk.yellow(`  warning: unknown harness '${key}', skipping`));
        continue;
      }
      installHarness(harness);
    }
  }

  console.log('');
  console.log(chalk.green(`reespec initialized at ./${REESPEC_DIR}`));
  console.log('');
  console.log('Getting started:');
  console.log('  Ask your agent to use the reespec-discover skill');
  console.log(`  Or: ${chalk.cyan('reespec new request "your idea"')}`);
}

function cmdInstall(args) {
  let toolsFlag = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tools') toolsFlag = args[++i] ?? '';
  }
  if (!toolsFlag) die('usage: reespec install --tools <harness[,harness]|all>');

  const keys = toolsFlag === 'all' ? HARNESSES.map(h => h.key) : toolsFlag.split(',').map(s => s.trim());
  console.log('Installing skills...');
  for (const key of keys) {
    const harness = harnessById(key);
    if (!harness) { console.warn(chalk.yellow(`  warning: unknown harness '${key}', skipping`)); continue; }
    installHarness(harness);
  }
  console.log('Done. Restart your IDE for slash commands to take effect.');
}

function cmdNew(args) {
  if (args[0] !== 'request') die('usage: reespec new request <name>');
  const name = args[1];
  if (!name) die('request name required');

  const base = path.join(REQUESTS_DIR, name);
  if (exists(base)) die(`request '${name}' already exists at ${base}`);

  mkdirp(path.join(base, 'specs'));

  fs.writeFileSync(path.join(base, 'brief.md'), `# Brief — ${name}

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
`);

  fs.writeFileSync(path.join(base, 'design.md'), `# Design — ${name}

## Context

<!-- Background needed to understand the design decisions. -->

## Approach

<!-- How will this be implemented? Key decisions and tradeoffs. -->

## Risks

<!-- What could go wrong? What are the tradeoffs? -->
`);

  fs.writeFileSync(path.join(base, 'tasks.md'), `# Tasks — ${name}

<!--
Every task has exactly 3 checklist steps — no exceptions:

  ### N. Task title

  - [ ] **RED**    — For code tasks: write the test file and run it (must fail).
                     For non-code tasks: check the observable assertion (must fail).
  - [ ] **ACTION** — Implement the minimal thing to make it pass.
  - [ ] **GREEN**  — Run the test / re-check the assertion (must pass).

Code task RED always produces a runnable test file.
Non-code task RED is a specific binary assertion ("file contains X").
-->
`);

  console.log(`created request '${name}' at ${base}`);
  console.log('artifacts: brief.md, design.md, specs/, tasks.md');
}

function cmdList() {
  if (!exists(REQUESTS_DIR)) {
    console.log("no requests found — run 'reespec init' first");
    return;
  }
  const entries = fs.readdirSync(REQUESTS_DIR).filter(e => {
    if (e === 'archive') return false;
    return fs.statSync(path.join(REQUESTS_DIR, e)).isDirectory();
  });
  if (entries.length === 0) {
    console.log("no active requests — run 'reespec new request <name>' to create one");
    return;
  }
  for (const req of entries) {
    console.log(`${chalk.bold(req)}  ${artifactStatus(req)}`);
  }
}

function cmdStatus(args) {
  let reqName = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--request') reqName = args[++i] ?? '';
  }
  if (!reqName) die('usage: reespec status --request <name>');

  const base = path.join(REQUESTS_DIR, reqName);
  if (!exists(base)) die(`request '${reqName}' not found`);

  console.log(`request: ${chalk.bold(reqName)}`);
  console.log('');

  for (const f of ['brief.md', 'design.md', 'tasks.md']) {
    const p = path.join(base, f);
    if (isNonEmpty(p)) {
      const lines = fs.readFileSync(p, 'utf8').split('\n').length;
      console.log(`  ${chalk.green('✓')} ${f} (${lines} lines)`);
    } else {
      console.log(`  ${chalk.red('✗')} ${f} (missing or empty)`);
    }
  }

  const specsDir = path.join(base, 'specs');
  if (exists(specsDir)) {
    const specFiles = [];
    function findSpecs(dir) {
      for (const e of fs.readdirSync(dir)) {
        const full = path.join(dir, e);
        if (fs.statSync(full).isDirectory()) findSpecs(full);
        else if (e === 'spec.md') specFiles.push(full);
      }
    }
    findSpecs(specsDir);
    if (specFiles.length > 0) {
      console.log(`  ${chalk.green('✓')} specs/ (${specFiles.length} spec files)`);
    } else {
      console.log(`  ${chalk.red('✗')} specs/ (empty)`);
    }
  } else {
    console.log(`  ${chalk.red('✗')} specs/ (missing)`);
  }

  console.log('');

  const tasksFile = path.join(base, 'tasks.md');
  if (exists(tasksFile)) {
    const content = fs.readFileSync(tasksFile, 'utf8');
    const total = (content.match(/^- \[/gm) ?? []).length;
    const done = (content.match(/^- \[x\]/gm) ?? []).length;
    console.log(`  tasks: ${done}/${total} complete`);
  }
}

async function cmdArchive(args) {
  let reqName = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--request') reqName = args[++i] ?? '';
  }
  if (!reqName) die('usage: reespec archive --request <name>');

  const base = path.join(REQUESTS_DIR, reqName);
  if (!exists(base)) die(`request '${reqName}' not found`);

  mkdirp(ARCHIVE_DIR);

  const today = new Date().toISOString().slice(0, 10);
  const target = path.join(ARCHIVE_DIR, `${today}-${reqName}`);
  if (exists(target)) die(`archive target already exists: ${target}`);

  // warn on incomplete tasks
  const tasksFile = path.join(base, 'tasks.md');
  if (exists(tasksFile)) {
    const content = fs.readFileSync(tasksFile, 'utf8');
    const incomplete = (content.match(/^- \[ \]/gm) ?? []).length;
    if (incomplete > 0) {
      const answer = await promptConfirm(
        `warning: ${incomplete} incomplete task(s) in tasks.md\narchive anyway? [y/N] `
      );
      if (answer !== 'y') {
        console.log('archive cancelled');
        return;
      }
    }
  }

  fs.renameSync(base, target);
  console.log(`archived: ${reqName} → ${target}`);
}

function cmdUpdate() {
  // detect which harnesses are already installed by checking skillsDir existence
  const installed = HARNESSES.filter(h => exists(h.skillsDir));

  if (installed.length === 0) {
    console.log(chalk.yellow('No harnesses detected in this project.'));
    console.log(`Run ${chalk.cyan('reespec install --tools <harness>')} to set up harnesses first.`);
    return;
  }

  console.log(`Updating ${installed.length} harness(es)...`);
  for (const harness of installed) {
    installHarness(harness);
  }
  console.log('');
  console.log(chalk.green('Skills updated. Restart your IDE for changes to take effect.'));
}

function cmdHarnesses() {
  console.log('Supported agent harnesses:');
  console.log('');
  for (const h of HARNESSES) {
    console.log(`  ${chalk.cyan(h.key.padEnd(12))} ${h.display.padEnd(14)} (skills → ${h.skillsDir})`);
  }
  console.log('');
  console.log('Usage: reespec init --tools pi,opencode');
  console.log('       reespec install --tools all');
}

// ── dispatch ──────────────────────────────────────────────────────────────────

function printUsage() {
  console.log(`${chalk.bold('reespec')} — human-agent collaboration framework`);
  console.log('');
  console.log(`Usage: ${chalk.cyan('reespec <command> [options]')}`);
  console.log('');
  console.log('Commands:');
  console.log(`  ${chalk.cyan('init')} [--tools <harnesses>]       initialise reespec + install skills`);
  console.log(`  ${chalk.cyan('install')} --tools <harnesses>      install skills into agent harnesses`);
  console.log(`  ${chalk.cyan('new')} request <name>               scaffold a new request`);
  console.log(`  ${chalk.cyan('list')}                             list active requests`);
  console.log(`  ${chalk.cyan('status')} --request <name>          show artifact status`);
  console.log(`  ${chalk.cyan('archive')} --request <name>         archive a completed request`);
  console.log(`  ${chalk.cyan('update')}                           re-sync skills into installed harnesses`);
  console.log(`  ${chalk.cyan('harnesses')}                        list supported agent harnesses`);
  console.log('');
  console.log('Examples:');
  console.log(`  ${chalk.dim('reespec init')}                     interactive harness selection`);
  console.log(`  ${chalk.dim('reespec init --tools pi,opencode')} non-interactive`);
  console.log(`  ${chalk.dim('reespec install --tools all')}      install to all harnesses`);
}

const [,, command, ...rest] = process.argv;

switch (command) {
  case 'init':      await cmdInit(rest); break;
  case 'install':   cmdInstall(rest); break;
  case 'new':       cmdNew(rest); break;
  case 'list':      cmdList(); break;
  case 'status':    cmdStatus(rest); break;
  case 'archive':   await cmdArchive(rest); break;
  case 'update':    cmdUpdate(); break;
  case 'harnesses': cmdHarnesses(); break;
  case undefined:   printUsage(); process.exit(1); break;
  default:          die(`unknown command: ${command}`);
}
