/**
 * CLI integration tests for reespec
 * Tests behavior through the public CLI interface only.
 * Run: node --test tests/cli.test.mjs
 */

import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(__dirname, '../bin/reespec.mjs');

// ── helpers ───────────────────────────────────────────────────────────────────

function run(args, cwd) {
  const result = spawnSync('node', [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env },
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    code: result.status ?? 1,
    output: (result.stdout ?? '') + (result.stderr ?? ''),
  };
}

function tmpdir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'reespec-test-'));
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('reespec CLI', () => {

  describe('usage', () => {
    test('prints usage when run with no arguments', () => {
      const dir = tmpdir();
      try {
        const r = run([], dir);
        assert.ok(r.output.includes('reespec'), 'should mention reespec');
        assert.ok(r.output.includes('init'), 'should list init command');
        assert.ok(r.output.includes('new'), 'should list new command');
        assert.equal(r.code, 1, 'should exit 1 with no args');
      } finally { cleanup(dir); }
    });

    test('harnesses lists all 7 supported harnesses', () => {
      const dir = tmpdir();
      try {
        const r = run(['harnesses'], dir);
        assert.equal(r.code, 0);
        for (const key of ['pi', 'opencode', 'claude', 'cursor', 'windsurf', 'cline', 'roocode']) {
          assert.ok(r.output.includes(key), `should list harness: ${key}`);
        }
      } finally { cleanup(dir); }
    });

    test('unknown command exits with error', () => {
      const dir = tmpdir();
      try {
        const r = run(['bogus-command'], dir);
        assert.notEqual(r.code, 0, 'should exit non-zero');
        assert.ok(r.output.toLowerCase().includes('unknown'), 'should say unknown command');
      } finally { cleanup(dir); }
    });
  });

  describe('reespec init', () => {
    test('creates reespec/ directory structure', () => {
      const dir = tmpdir();
      try {
        const r = run(['init', '--tools', 'pi'], dir);
        assert.equal(r.code, 0);
        assert.ok(fs.existsSync(path.join(dir, 'reespec')), 'reespec/ should exist');
        assert.ok(fs.existsSync(path.join(dir, 'reespec/requests')), 'requests/ should exist');
        assert.ok(fs.existsSync(path.join(dir, 'reespec/requests/archive')), 'archive/ should exist');
      } finally { cleanup(dir); }
    });

    test('creates decisions.md with correct structure', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        const decisionsPath = path.join(dir, 'reespec/decisions.md');
        assert.ok(fs.existsSync(decisionsPath), 'decisions.md should exist');
        const content = fs.readFileSync(decisionsPath, 'utf8');
        assert.ok(content.includes('# Decisions'), 'should have heading');
        assert.ok(content.includes('What belongs here'), 'should have guidance');
        assert.ok(content.includes('What does NOT belong'), 'should have anti-patterns');
      } finally { cleanup(dir); }
    });

    test('installs skills for selected harness', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        for (const skill of ['reespec-discover', 'reespec-plan', 'reespec-execute', 'reespec-archive']) {
          const p = path.join(dir, `.pi/skills/${skill}/SKILL.md`);
          assert.ok(fs.existsSync(p), `skill should be installed: ${skill}`);
        }
      } finally { cleanup(dir); }
    });

    test('installs skills for multiple harnesses', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi,opencode,claude'], dir);
        assert.ok(fs.existsSync(path.join(dir, '.pi/skills/reespec-discover/SKILL.md')));
        assert.ok(fs.existsSync(path.join(dir, '.opencode/skills/reespec-discover/SKILL.md')));
        assert.ok(fs.existsSync(path.join(dir, '.claude/skills/reespec-discover/SKILL.md')));
      } finally { cleanup(dir); }
    });

    test('installs command prompt files alongside skills', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        assert.ok(fs.existsSync(path.join(dir, '.pi/prompts/reespec-discover.md')));
        assert.ok(fs.existsSync(path.join(dir, '.pi/prompts/reespec-plan.md')));
        assert.ok(fs.existsSync(path.join(dir, '.pi/prompts/reespec-execute.md')));
        assert.ok(fs.existsSync(path.join(dir, '.pi/prompts/reespec-archive.md')));
      } finally { cleanup(dir); }
    });

    test('prompt files contain description frontmatter', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        const content = fs.readFileSync(path.join(dir, '.pi/prompts/reespec-discover.md'), 'utf8');
        assert.ok(content.startsWith('---'), 'should start with frontmatter');
        assert.ok(content.includes('description:'), 'should have description field');
      } finally { cleanup(dir); }
    });

    test('running init twice skips existing decisions.md', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        // write a custom marker
        const decisionsPath = path.join(dir, 'reespec/decisions.md');
        fs.appendFileSync(decisionsPath, '\n### My custom entry\n');
        // run again
        run(['init', '--tools', 'pi'], dir);
        const content = fs.readFileSync(decisionsPath, 'utf8');
        assert.ok(content.includes('My custom entry'), 'existing decisions.md should not be overwritten');
      } finally { cleanup(dir); }
    });

    test('--tools all installs all 7 harnesses', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'all'], dir);
        const harnessDirs = ['.pi', '.opencode', '.claude', '.cursor', '.windsurf', '.cline', '.roo'];
        for (const h of harnessDirs) {
          assert.ok(
            fs.existsSync(path.join(dir, `${h}/skills/reespec-discover/SKILL.md`)),
            `should install to ${h}`
          );
        }
      } finally { cleanup(dir); }
    });
  });

  describe('reespec new request', () => {
    test('creates request directory with all 4 artifacts', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        const r = run(['new', 'request', 'my-feature'], dir);
        assert.equal(r.code, 0);
        const base = path.join(dir, 'reespec/requests/my-feature');
        assert.ok(fs.existsSync(path.join(base, 'brief.md')));
        assert.ok(fs.existsSync(path.join(base, 'design.md')));
        assert.ok(fs.existsSync(path.join(base, 'tasks.md')));
        assert.ok(fs.existsSync(path.join(base, 'specs')));
      } finally { cleanup(dir); }
    });

    test('scaffolded tasks.md contains 3-step format instructions', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        run(['new', 'request', 'my-feature'], dir);
        const content = fs.readFileSync(
          path.join(dir, 'reespec/requests/my-feature/tasks.md'), 'utf8'
        );
        assert.ok(content.includes('RED'), 'tasks.md should mention RED');
        assert.ok(content.includes('ACTION'), 'tasks.md should mention ACTION');
        assert.ok(content.includes('GREEN'), 'tasks.md should mention GREEN');
      } finally { cleanup(dir); }
    });

    test('fails if request already exists', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        run(['new', 'request', 'duplicate'], dir);
        const r = run(['new', 'request', 'duplicate'], dir);
        assert.notEqual(r.code, 0, 'should fail on duplicate');
        assert.ok(r.output.toLowerCase().includes('exists'), 'should say already exists');
      } finally { cleanup(dir); }
    });

    test('fails without request name', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        const r = run(['new', 'request'], dir);
        assert.notEqual(r.code, 0);
      } finally { cleanup(dir); }
    });
  });

  describe('reespec list', () => {
    test('shows no requests message when empty', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        const r = run(['list'], dir);
        assert.equal(r.code, 0);
        assert.ok(r.output.includes('no active'), 'should say no active requests');
      } finally { cleanup(dir); }
    });

    test('lists active requests', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        run(['new', 'request', 'alpha'], dir);
        run(['new', 'request', 'beta'], dir);
        const r = run(['list'], dir);
        assert.equal(r.code, 0);
        assert.ok(r.output.includes('alpha'), 'should list alpha');
        assert.ok(r.output.includes('beta'), 'should list beta');
      } finally { cleanup(dir); }
    });

    test('does not list archived requests', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        run(['new', 'request', 'done'], dir);
        run(['archive', '--request', 'done'], dir);
        const r = run(['list'], dir);
        assert.ok(!r.output.includes('done') || r.output.includes('no active'), 'archived should not appear in list');
      } finally { cleanup(dir); }
    });
  });

  describe('reespec status', () => {
    test('shows artifact status for a request', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        run(['new', 'request', 'my-req'], dir);
        const r = run(['status', '--request', 'my-req'], dir);
        assert.equal(r.code, 0);
        assert.ok(r.output.includes('brief.md'));
        assert.ok(r.output.includes('design.md'));
        assert.ok(r.output.includes('tasks.md'));
      } finally { cleanup(dir); }
    });

    test('fails for unknown request', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        const r = run(['status', '--request', 'nonexistent'], dir);
        assert.notEqual(r.code, 0);
      } finally { cleanup(dir); }
    });

    test('fails without --request flag', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        const r = run(['status'], dir);
        assert.notEqual(r.code, 0);
      } finally { cleanup(dir); }
    });
  });

  describe('reespec archive', () => {
    test('moves request to dated archive path', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        run(['new', 'request', 'done-req'], dir);
        const r = run(['archive', '--request', 'done-req'], dir);
        assert.equal(r.code, 0);
        // original path gone
        assert.ok(!fs.existsSync(path.join(dir, 'reespec/requests/done-req')), 'original should be gone');
        // archived with date prefix
        const archiveDir = path.join(dir, 'reespec/requests/archive');
        const entries = fs.readdirSync(archiveDir);
        const archived = entries.find(e => e.endsWith('-done-req'));
        assert.ok(archived, 'should be in archive with date prefix');
        assert.match(archived, /^\d{4}-\d{2}-\d{2}-done-req$/, 'should have YYYY-MM-DD prefix');
      } finally { cleanup(dir); }
    });

    test('fails for unknown request', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        const r = run(['archive', '--request', 'ghost'], dir);
        assert.notEqual(r.code, 0);
      } finally { cleanup(dir); }
    });

    test('fails without --request flag', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        const r = run(['archive'], dir);
        assert.notEqual(r.code, 0);
      } finally { cleanup(dir); }
    });
  });

  describe('reespec install', () => {
    test('installs skills into specified harness', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        // install into a second harness
        const r = run(['install', '--tools', 'cursor'], dir);
        assert.equal(r.code, 0);
        assert.ok(fs.existsSync(path.join(dir, '.cursor/skills/reespec-discover/SKILL.md')));
      } finally { cleanup(dir); }
    });

    test('fails without --tools flag', () => {
      const dir = tmpdir();
      try {
        run(['init', '--tools', 'pi'], dir);
        const r = run(['install'], dir);
        assert.notEqual(r.code, 0);
      } finally { cleanup(dir); }
    });
  });

});
