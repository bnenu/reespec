# Tasks — reespec-evals

## Group 1: Eval infrastructure

### 1. Add promptfoo as dev dependency and scaffold evals/ directory

- [x] **RED** — Run `node -e "require('promptfoo')"` → fails (module not found).
      Check `ls evals/` → directory does not exist.
- [x] **ACTION** — Run `npm install --save-dev promptfoo`. Create directory structure:
      `evals/public/discover/`, `evals/public/plan/`, `evals/public/execute/`,
      `evals/judges/`. Add `evals/private/` to `.gitignore`.
- [x] **GREEN** — `node_modules/promptfoo` present, `package.json` shows `"promptfoo": "^0.121.3"` in devDependencies.
      `ls evals/public/` → shows `discover plan execute`.
      `grep "evals/private" .gitignore` → line present.
      (Note: `require('promptfoo')` triggers a side-effect mkdir of `~/.promptfoo` which
      is permission-blocked in this environment — not a module resolution issue.)

---

### 2. Add npm scripts for running evals

- [x] **RED** — Run `npm run eval:structural` → fails ("missing script: eval:structural").
      Run `npm run eval:semantic` → fails. Run `npm run eval` → fails.
- [x] **ACTION** — Add to `package.json` scripts:
      `"eval": "promptfoo eval --config evals/promptfoo.yaml"`,
      `"eval:structural": "promptfoo eval --config evals/promptfoo.yaml --filter-pattern structural"`,
      `"eval:semantic": "promptfoo eval --config evals/promptfoo.yaml --filter-pattern semantic"`,
      `"eval:private": "promptfoo eval --config evals/promptfoo.yaml --tests evals/private/sessions"`,
      `"eval:compare": "promptfoo eval --config evals/promptfoo.yaml --output evals/compare-report.html"`.
- [x] **GREEN** — `npm run eval:structural` exits without "missing script" error.
      `cat package.json | grep eval` → shows all 5 scripts.

---

### 3. Create promptfoo base config

- [x] **RED** — Run `cat evals/promptfoo.yaml` → file does not exist.
- [x] **ACTION** — Create `evals/promptfoo.yaml` with:
      - At least one provider entry (defaulting to `openai:gpt-4o-mini` for cost)
      - `tests` pointing to `evals/public/`
      - A default description and output format
      - A comment block explaining how to override the provider for cross-harness runs.
- [x] **GREEN** — `cat evals/promptfoo.yaml` → file exists, contains `providers:`,
      `tests:`, and references `evals/public/`.

---

### 4. Create LLM judge prompt files

- [x] **RED** — Run `ls evals/judges/` → directory does not exist or is empty.
- [x] **ACTION** — Create the five judge prompt files:
      `evals/judges/one-question-per-turn.md`,
      `evals/judges/no-premature-solution.md`,
      `evals/judges/real-red-assertion.md`,
      `evals/judges/verified-green.md`,
      `evals/judges/cross-harness-drift.md`.
      Each SHALL follow the format: `## Criterion`, `## The agent's response` with
      `{{output}}` placeholder, `## Verdict` with PASS/FAIL instruction.
- [x] **GREEN** — `ls evals/judges/` → shows all 5 files.
      `grep "{{output}}" evals/judges/*.md | wc -l` → 5.
      `grep "PASS or FAIL" evals/judges/*.md | wc -l` → 5.

---

### 5. Add CI workflow for structural evals

- [x] **RED** — Run `cat .github/workflows/evals.yml` → file does not exist.
- [x] **ACTION** — Create `.github/workflows/evals.yml` with:
      - Trigger on push paths: `skills/**`, `evals/public/**`, `evals/promptfoo.yaml`
      - Job: checkout, `npm ci`, `npm run eval:structural`
      - No LLM API key required (structural checks are programmatic only)
- [x] **GREEN** — File exists, contains `paths:`, `skills/**`, `npm run eval:structural`.
      `grep "OPENAI_API_KEY\|ANTHROPIC_API_KEY" .github/workflows/evals.yml` → empty.

---

## Group 2: Public discover scenarios

### 6. Draft and commit discover scenario: vague idea

- [x] **RED** — Run `ls evals/public/discover/01-vague-idea/` → directory does not exist.
- [x] **ACTION** — Drafted `conversation.yaml` (scripted multi-turn with a user who has
      vague intent: "I want to improve my workflow somehow") and `criteria.md` (structural:
      ≤1 question per agent turn; semantic: no premature solution). Human reviews and refines.
- [x] **GREEN** — `ls evals/public/discover/01-vague-idea/` → shows `conversation.yaml criteria.md`.
      `grep "no-premature-solution" criteria.md` → line present.

---

### 7. Draft and commit discover scenario: premature solution

- [x] **RED** — Run `ls evals/public/discover/02-premature-solution/` → directory does not exist.
- [x] **ACTION** — Drafted scenario where user immediately proposes "just add a webhook".
      Criteria checks that agent explored the problem before accepting the solution.
- [x] **GREEN** — `ls evals/public/discover/02-premature-solution/` → shows `conversation.yaml criteria.md`.
      `grep "premature\|solution" criteria.md` → lines present.

---

### 8. Draft and commit discover scenario: multiple open threads

- [x] **RED** — Run `ls evals/public/discover/03-multiple-threads/` → directory does not exist.
- [x] **ACTION** — Drafted scenario where user opens 5+ threads (channels, preferences,
      quiet hours, digest mode, scale, build-vs-buy). Agent must ask only one question.
- [x] **GREEN** — `ls evals/public/discover/03-multiple-threads/` → shows `conversation.yaml criteria.md`.
      `grep "one question\|single question\|1 question" criteria.md` → lines present.

---

## Group 3: Public plan scenarios

### 9. Draft and commit plan scenario: code request with fake RED detection

- [x] **RED** — Run `ls evals/public/plan/01-code-request/` → directory does not exist.
- [x] **ACTION** — Drafted scenario where agent produces tasks.md for user authentication
      (POST /login endpoint). Structural: RED/ACTION/GREEN keywords in every task.
      Semantic: RED describes real runnable test files, not vague descriptions.
- [x] **GREEN** — `ls evals/public/plan/01-code-request/` → shows `conversation.yaml criteria.md`.
      `grep "real-red-assertion" criteria.md` → line present.

---

### 10. Draft and commit plan scenario: non-code request with binary assertion

- [x] **RED** — Run `ls evals/public/plan/02-noncode-request/` → directory does not exist.
- [x] **ACTION** — Drafted scenario for contributing guide documentation task. RED
      assertions use grep/cat checks (binary) not vague quality judgments.
- [x] **GREEN** — `ls evals/public/plan/02-noncode-request/` → shows `conversation.yaml criteria.md`.
      `grep "real-red-assertion\|binary" criteria.md` → lines present.

---

## Group 4: Public execute scenarios

### 11. Draft and commit execute scenario: fake GREEN detection

- [x] **RED** — Run `ls evals/public/execute/01-fake-green/` → directory does not exist.
- [x] **ACTION** — Drafted scenario where agent executes a validate() task. Compliant
      agent shows actual test runner output before marking GREEN (not "should pass").
- [x] **GREEN** — `ls evals/public/execute/01-fake-green/` → shows `conversation.yaml criteria.md`.
      `grep "verified-green" criteria.md` → line present.

---

### 12. Draft and commit execute scenario: RED before implementation

- [x] **RED** — Run `ls evals/public/execute/02-red-first/` → directory does not exist.
- [x] **ACTION** — Drafted scenario for formatDate() task. Structural check: RED before
      ACTION. Semantic check: agent wrote and ran a failing test before implementing.
- [x] **GREEN** — `ls evals/public/execute/02-red-first/` → shows `conversation.yaml criteria.md`.
      `grep "real-red-assertion\|RED.*before" criteria.md` → lines present.

---

## Group 5: Private eval workflow

### 13. Document private eval format and transcript export process

- [x] **RED** — `ls evals/private/` → directory does not exist. `cat evals/private/README.md` → not found.
- [x] **ACTION** — Created `evals/private/` locally (not committed). Wrote `evals/private/README.md`
      covering: conversation.yaml format, label.md format (good/bad/borderline + judge calibration),
      harnesses tested, example good and bad session transcripts.
- [x] **GREEN** — `cat evals/private/README.md` → contains "good / bad / borderline",
      "conversation.yaml", and example transcripts. `git status evals/private/` → nothing shown.

---

### 14. Label first three real sessions and run private evals

- [ ] **RED** — Run `ls evals/private/sessions/` → directory is empty or does not exist.
      (No labelled sessions yet.)
- [ ] **ACTION** — Select 3 real interaction sessions (mix of good and bad quality).
      Format each as `conversation.yaml`. Write `label.md` for each with human judgement.
      Run `npm run eval:private` to get judge scores. Record agreement/disagreement in
      each `label.md` under "Judge calibration".
- [ ] **GREEN** — Run `ls evals/private/sessions/` → shows at least 3 dated session directories.
      Each contains `conversation.yaml`, `criteria.md`, `label.md`.
      Run `grep "Judge calibration" evals/private/sessions/*/label.md | wc -l` → returns ≥3.

---

### 15. Tune judge prompts to ≥80% agreement with human labels

- [ ] **RED** — Run `npm run eval:private 2>&1 | grep "agreement"` → no agreement metric
      reported yet, or agreement is below 80% on labelled sessions.
- [ ] **ACTION** — Review disagreements between judge scores and human labels. Identify
      which judge prompts are producing false positives or false negatives. Refine the
      relevant files in `evals/judges/`. Re-run `npm run eval:private`. Iterate until
      agreement ≥80%.
- [ ] **GREEN** — Run `npm run eval:private` → output shows ≥80% agreement between
      judge scores and human labels across all labelled sessions.
      Human verifies: the judge catches the fake RED and fake GREEN cases that were
      labelled bad, and passes the good-quality sessions.

---

## Group 6: README and discoverability

### 16. Add Consistency section to README

- [x] **RED** — `grep -n "Consistency\|eval" README.md` → no "Consistency" section exists.
- [x] **ACTION** — Added "## Consistency" section to README covering: failure modes checked,
      public scenario index, all 5 npm run eval scripts, CI vs on-demand split, private evals note.
- [x] **GREEN** — `grep "## Consistency" README.md` → section header present.
      `grep "npm run eval" README.md` → 5 script references present.
