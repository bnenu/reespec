# Tasks — reespec Framework

## 1. CLI Scaffold

### 1.1 reespec init

- [x] RED:    Running `reespec init` in an empty directory fails (command not found or no output)
- [x] ACTION: Implement `reespec init` — creates `reespec/decisions.md` (empty with header) and `reespec/requests/` directory
- [x] GREEN:  `reespec init` runs without error, `reespec/decisions.md` and `reespec/requests/` exist

### 1.2 reespec new request

- [x] RED:    Running `reespec new request "add-auth"` produces no files
- [x] ACTION: Implement `reespec new request "<name>"` — scaffolds `reespec/requests/<name>/` with empty `brief.md`, `design.md`, `specs/`, `tasks.md`
- [x] GREEN:  Directory and all four artifact placeholders exist at correct paths

### 1.3 reespec list

- [x] RED:    Running `reespec list` returns no output or error
- [x] ACTION: Implement `reespec list` — reads `reespec/requests/` and prints active (non-archived) request names with artifact completion status
- [x] GREEN:  `reespec list` prints at least the request created in 1.2 with correct status

### 1.4 reespec status

- [x] RED:    Running `reespec status --request "add-auth"` returns no output or error
- [x] ACTION: Implement `reespec status --request "<name>"` — reads request directory, reports which artifacts exist and are non-empty
- [x] GREEN:  Status output correctly identifies empty vs populated artifacts for a test request

### 1.5 reespec archive

- [x] RED:    Running `reespec archive --request "add-auth"` produces no output or does not move files
- [x] ACTION: Implement `reespec archive --request "<name>"` — moves `reespec/requests/<name>` to `reespec/requests/archive/YYYY-MM-DD-<name>`
- [x] GREEN:  Archived request exists at dated path, original path no longer exists

---

## 2. reespec-discover Skill

### 2.1 Write failing skill invocation test

- [x] RED:    No test exists that verifies the discover skill loads and enters correct stance
- [x] ACTION: Write test: load `reespec-discover` skill, verify agent asks one question (not multiple), verify it reads decisions.md if present
- [x] GREEN:  Test exists and fails (skill does not exist yet)

### 2.2 Implement reespec-discover SKILL.md

- [x] RED:    Test from 2.1 fails
- [x] ACTION: Write `reespec-discover/SKILL.md` encoding: thinking partner stance, one-question-at-a-time discipline, grill-me pressure as clarity emerges, saturation detection, no-implementation guardrail, decisions.md consultation, insight capture offer
- [x] GREEN:  Test from 2.1 passes; skill loads without error

### 2.3 Verify one-question-at-a-time behavior

- [x] RED:    No assertion exists that the skill instructs the agent to ask only one question per turn
- [x] ACTION: Add explicit rule to SKILL.md: "Ask only one question per turn. Wait for the answer. Then ask the next."
- [x] GREEN:  SKILL.md contains explicit single-question-per-turn instruction; spot-check with agent confirms behavior

---

## 3. reespec-plan Skill

### 3.1 Write failing skill test

- [x] RED:    No test exists for plan skill artifact production order
- [x] ACTION: Write test: verify plan skill reads brief before design, reads design before specs, reads all before tasks
- [x] GREEN:  Test exists and fails (skill does not exist yet)

### 3.2 Implement reespec-plan SKILL.md

- [x] RED:    Test from 3.1 fails
- [x] ACTION: Write `reespec-plan/SKILL.md` encoding: artifact dependency order, universal RED/ACTION/GREEN task format, TDD discipline for code tasks, assertion derivation guidance, human review gate before execution
- [x] GREEN:  Test from 3.1 passes

### 3.3 Verify universal task format encoding

- [x] RED:    SKILL.md does not contain explicit RED/ACTION/GREEN template
- [x] ACTION: Add explicit task format template to SKILL.md with separate examples for code tasks (failing test) and non-code tasks (observable assertion)
- [x] GREEN:  SKILL.md contains both examples; format is unambiguous

### 3.4 Verify TDD vertical slice discipline

- [x] RED:    SKILL.md does not explicitly prohibit horizontal slicing
- [x] ACTION: Add explicit anti-pattern section: "Do NOT write all tests first then all implementations. One test → one implementation → repeat."
- [x] GREEN:  SKILL.md contains explicit prohibition with correct/incorrect examples

---

## 4. reespec-execute Skill

### 4.1 Write failing skill test

- [x] RED:    No test exists for execute skill RED enforcement and task marking
- [x] ACTION: Write test: verify execute skill checks RED before action, marks task complete after GREEN, pauses on blocker
- [x] GREEN:  Test exists and fails (skill does not exist yet)

### 4.2 Implement reespec-execute SKILL.md

- [x] RED:    Test from 4.1 fails
- [x] ACTION: Write `reespec-execute/SKILL.md` encoding: context reading before start, vertical slice execution, RED enforcement, GREEN verification, pause conditions, decisions.md update triggers, progress reporting
- [x] GREEN:  Test from 4.1 passes

### 4.3 Verify decisions.md update behavior

- [x] RED:    SKILL.md does not specify what triggers a decisions.md entry vs what does not
- [x] ACTION: Add explicit "log this / don't log this" guidance with examples of each
- [x] GREEN:  SKILL.md contains both positive and negative examples for decisions.md entries

---

## 5. reespec-archive Skill

### 5.1 Implement reespec-archive SKILL.md

- [x] RED:    No archive skill exists; running archive command has no agent guidance
- [x] ACTION: Write `reespec-archive/SKILL.md` encoding: incomplete task warning, human confirmation before proceeding, spec sync if delta specs exist, date-stamped archive path, clear summary output
- [x] GREEN:  Skill file exists, loads without error, contains all required behaviors

---

## 6. decisions.md

### 6.1 Define decisions.md template

- [x] RED:    `reespec init` creates an empty decisions.md with no structure
- [x] ACTION: Update `reespec init` to scaffold `decisions.md` with header, format example, and "what belongs / what does not belong" guidance as a comment block
- [x] GREEN:  `reespec init` produces a decisions.md with correct structure; a human reading it understands how to use it

### 6.2 Verify agent consultation during discover

- [x] RED:    reespec-discover SKILL.md does not instruct agent to read decisions.md at start
- [x] ACTION: Add explicit instruction: "At the start of every discover session, read `reespec/decisions.md` if it exists. Use it to ground the conversation in established decisions."
- [x] GREEN:  SKILL.md contains explicit decisions.md consultation instruction

---

## 7. Documentation

### 7.1 Write README

- [x] RED:    No README exists; a new user has no entry point
- [x] ACTION: Write `reespec/README.md` covering: what reespec is, install, three phases, artifact structure, decisions.md, CLI commands, example request walkthrough
- [x] GREEN:  README exists; covers all sections; a non-technical reader can follow it

### 7.2 Update architecture decisions log

- [x] RED:    decisions.md does not record the reespec framework design decisions
- [x] ACTION: Add entries to `reespec/decisions.md` for: RED/ACTION/GREEN universal task format, one-question-at-a-time discover discipline, decisions.md as shared cross-request log, build-on-openspec approach
- [x] GREEN:  decisions.md contains at least four entries covering the above
