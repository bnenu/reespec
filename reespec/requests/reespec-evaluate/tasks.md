# Tasks — reespec-evaluate

All tasks are non-code (skill authoring, package scaffolding, documentation).
RED assertions are observable: file existence, content presence, structural checks.

---

### 1. Scaffold the pi-evaluate repo

- [x] **RED** — Check: directory `/Users/bn/p/pel/pi-evaluate` does not exist, or
      exists but lacks `package.json` and `extensions/` and `skills/evaluate/SKILL.md`.
      Assertion fails — structure is absent.
- [x] **ACTION** — Create the repo directory and scaffold:
      `package.json` (name: "pi-evaluate", pi.extensions, peerDependencies on pi),
      `extensions/evaluate.ts` (stub entry point),
      `skills/evaluate/SKILL.md` (stub),
      `README.md` (stub),
      `CHANGELOG.md` (stub).
- [x] **GREEN** — Verify: `/Users/bn/p/pel/pi-evaluate/package.json` exists and
      contains `"name": "pi-evaluate"` and `"pi"` key with extensions array.
      `skills/evaluate/SKILL.md` exists and is non-empty.

---

### 2. Write the evaluate SKILL.md — contract entry modes

- [x] **RED** — Check: `skills/evaluate/SKILL.md` does not contain sections
      "Reespec mode" and "Standalone mode" and the prompt text
      "What's the contract?". Assertion fails — sections are absent.
- [x] **ACTION** — Write the full contract entry mode logic into `SKILL.md`:
      reespec detection heuristic (check for `reespec/requests/`),
      single/multiple active request handling,
      standalone fallback with user prompt,
      abort on empty contract.
- [x] **GREEN** — Verify: `SKILL.md` contains "reespec mode", "standalone mode",
      "What's the contract?", and the abort message for empty input.

---

### 3. Write the evaluate SKILL.md — verdict engine

- [x] **RED** — Check: `skills/evaluate/SKILL.md` does not contain all four verdict
      labels (SATISFIED, PARTIAL, UNSATISFIED, UNCLEAR) and the triage summary
      section headers (Safe to skip, Worth a look, Human call).
      Assertion fails — verdict format is absent. (Note: content was written as
      a complete document in Task 2 — assertion was already passing by Task 3.)
- [x] **ACTION** — Write the full verdict engine logic into `SKILL.md`:
      per-spec verdict blocks with reason and focus hint,
      adversarial stance instruction (look for gaps, not confirmation),
      output type inference from contract language,
      triage summary format.
- [x] **GREEN** — Verify: `SKILL.md` contains SATISFIED, PARTIAL, UNSATISFIED,
      UNCLEAR, "Safe to skip", "Worth a look", "Human call", and explicit
      instruction that tasks.md and design.md are excluded.

---

### 4. Write the evaluate SKILL.md — guardrails and examples

- [x] **RED** — Check: `skills/evaluate/SKILL.md` does not contain a "Guardrails"
      section and an "Example verdict" section. Assertion fails — sections are absent.
- [x] **ACTION** — Add to `SKILL.md`:
      Guardrails section (never read tasks.md/design.md, never re-enter execute,
      never fix gaps, always anchor reason in contract language or file paths,
      UNCLEAR is not failure — it flags underspecification).
      Example verdict section showing one full verdict block per label type.
- [x] **GREEN** — Verify: `SKILL.md` contains "Guardrails" section and
      "Example" section with at least one complete verdict block.

---

### 5. Write the README

- [x] **RED** — Check: `README.md` does not contain sections "What it does",
      "Reespec mode", "Standalone mode", "Installation", and "The GAN idea".
      Assertion fails — sections are absent.
- [x] **ACTION** — Write the full README covering:
      what the skill does (adversarial post-execute evaluation, focus guidance),
      reespec mode (automatic, invoked after execute),
      standalone mode (freeform contract, example paste),
      installation (`npm install pi-evaluate`),
      the GAN inspiration (brief, accessible — discriminator analogy).
- [x] **GREEN** — Verify: `README.md` contains all five section headings and
      is at least 300 words (substantive, not stub).

---

### 6. Wire the extension entry point

- [x] **RED** — Check: `extensions/evaluate.ts` does not register the evaluate skill
      with pi (does not export a pi extension object or call skill registration).
      Assertion fails — extension is a stub.
- [x] **ACTION** — Implement `extensions/evaluate.ts` following the pi extension
      pattern from `pi-load-skill`: export the extension object, register
      `skills/evaluate/SKILL.md` as a loadable skill.
- [x] **GREEN** — Verify: `extensions/evaluate.ts` exports a default object with
      the pi extension shape and references `skills/evaluate/SKILL.md`.

---

### 7. Finalize package.json and CHANGELOG

- [x] **RED** — Check: `package.json` is missing one or more of: `"version"`,
      `"description"`, `"keywords"` (containing "pi-package"), `"files"` array
      including `extensions/` and `skills/`, `"peerDependencies"` with pi.
      `CHANGELOG.md` does not contain a `## 0.1.0` entry.
      Assertion fails — package metadata is incomplete.
- [x] **ACTION** — Complete `package.json` with all required fields following
      `pi-load-skill` as the reference. Write `CHANGELOG.md` with initial
      `## 0.1.0` entry describing the initial release.
- [x] **GREEN** — Verify: `package.json` contains all required fields.
      `CHANGELOG.md` contains `## 0.1.0`. Run `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"` — no parse errors.

---

### 9. Update evaluate SKILL.md — write evaluations.md after verdict

- [x] **RED** — Check: `skills/evaluate/SKILL.md` does not contain "evaluations.md"
      or instructions to append the verdict to a file. Assertion fails — artifact
      writing step is absent.
- [x] **ACTION** — Add a Step 5 to the evaluate SKILL.md: after producing verdicts
      and triage, append a timestamped entry to
      `reespec/requests/<name>/evaluations.md` (create if absent, append if exists).
      Entry format: `## Evaluation — YYYY-MM-DD HH:MM` followed by the full
      verdict blocks and triage summary. In standalone mode skip the write
      (no reespec artifact path available) and note this to the user.
- [x] **GREEN** — Verify: `skills/evaluate/SKILL.md` contains "evaluations.md",
      "append", and the entry format header `## Evaluation —`.

---

### 10. Update reespec-execute SKILL.md — read latest evaluation entry

- [x] **RED** — Check: `skills/reespec-execute/SKILL.md` (in the reespec repo) does
      not mention "evaluations.md" in the context reading step.
      Assertion fails — execute skill is unaware of evaluations.
- [x] **ACTION** — Edit `skills/reespec-execute/SKILL.md`:
      1. Add `evaluations.md` to the "Read all context" step (optional — read if exists).
      2. Add a new subsection after the context reading step:
         "If evaluations.md exists: read the LATEST entry only. Announce the gaps
         flagged as PARTIAL or UNSATISFIED. State that these will be prioritised."
         Announcement format:
         ```
         Found previous evaluation (<date>).
         Gaps flagged:
         ⚠️  <capability> — <one-line reason>
         ❌  <capability> — <one-line reason>
         I'll focus on these first, then work remaining tasks.
         ```
      3. Update the Guardrails section: add "Read only the latest evaluation entry —
         older entries are history, not current gaps."
- [x] **GREEN** — Verify: `skills/reespec-execute/SKILL.md` contains "evaluations.md",
      "latest entry", and the announcement format text "Found previous evaluation".

---

### 11. Create CHANGELOG.md in reespec repo and bump version to 1.1.0

- [x] **RED** — Check: `CHANGELOG.md` does not exist at repo root, and
      `package.json` version is "1.0.0". Assertion fails — changelog absent,
      version not bumped.
- [x] **ACTION** — Create `CHANGELOG.md` at repo root with an initial entry
      documenting v1.0.0 (original framework release) and a new v1.1.0 entry
      covering: evaluations.md artifact, execute skill awareness of evaluations,
      optional evaluate phase in the lifecycle. Bump `package.json` version to
      "1.1.0".
- [x] **GREEN** — Verify: `CHANGELOG.md` exists and contains `## 1.1.0` and
      `## 1.0.0`. `package.json` version field is "1.1.0".

---

### 12. Add reespec-evaluate skill to the reespec repo

- [x] **RED** — Check: `skills/reespec-evaluate/SKILL.md` does not exist in the
      reespec repo. Assertion fails — skill is absent.
- [x] **ACTION** — Create `skills/reespec-evaluate/SKILL.md`: a reespec-native
      evaluate skill that always operates in reespec context (no standalone mode,
      no contract prompt). It detects the active request, loads brief + specs,
      scans outputs, produces verdicts, appends to evaluations.md, and announces
      gaps. Follows the same frontmatter pattern as the other reespec-* skills.
- [x] **GREEN** — Verify: `skills/reespec-evaluate/SKILL.md` exists, frontmatter
      has `name: reespec-evaluate`, and the file contains "evaluations.md",
      all four verdict labels, and "Triage".

---

### 8. Initialize git repo and prepare for npm publish

- [x] **RED** — Check: `/Users/bn/p/pel/pi-evaluate` is not a git repository
      (no `.git/` directory). `package.json` `"name"` field is not confirmed
      available on npm. Assertion fails — repo not initialized.
- [x] **ACTION** — Run `git init`, create `.gitignore` (node_modules),
      `git add .`, `git commit -m "initial: pi-evaluate 0.1.0"`.
      Check npm availability: `npm view pi-evaluate 2>&1` — note result (404 = available).
- [x] **GREEN** — Verify: `.git/` directory exists. `git log --oneline` shows
      initial commit. `.gitignore` contains `node_modules`.
