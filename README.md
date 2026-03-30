# reespec

A human-agent collaboration framework for expressing intent, planning work, and tracing decisions over time.

---

## What is reespec?

reespec structures how humans and AI agents work together through four phases:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   discover    │────▶│     plan      │────▶│    execute    │────▶│   evaluate    │
│               │     │               │     │               │     │   (optional)  │
│ explore the   │     │ produce all   │     │ implement one │     │ verify output │
│ problem space │     │ artifacts with│     │ RED→GREEN     │     │ against the   │
│ one question  │     │ verifiable    │     │ cycle at a    │     │ contract,     │
│ at a time     │     │ assertions    │     │ time          │     │ triage gaps   │
└───────────────┘     └───────────────┘     └───────────────┘     └───────────────┘
```

**Two goals:**
1. Close the gap between human intent and what agents deliver
2. Provide traceability of intent vs implementation over time

---

## Install

**Prerequisites: Node.js 18+**

```bash
# install globally from npm (once published)
npm install -g reespec

# initialise in your project
cd your-project
reespec init
```

### Local development / contributing

```bash
git clone https://github.com/your-org/reespec
cd reespec
npm install        # install dependencies
export PATH="$PWD/bin:$PATH"
reespec init
```

---

## Quickstart

```bash
# 1. initialise
reespec init

# 2. start a new request
reespec new request "add-user-auth"

# 3. enter discover mode with your agent
# → ask your agent to use the reespec-discover skill

# 4. plan the request
# → ask your agent to use the reespec-plan skill

# 5. execute
# → ask your agent to use the reespec-execute skill

# 6. evaluate (optional — for complex requests)
# → ask your agent to use the reespec-evaluate skill

# 7. archive when done
reespec archive --request "add-user-auth"
```

---

## The Four Phases

### 1. discover

A thinking partner that won't let you off the hook.

- Starts exploratory — diagrams, analogies, open threads
- Tightens into pressure as clarity emerges — resolves every branch of the decision tree
- **Asks one question at a time** — waits for your answer before moving on
- Reads `decisions.md` to ground new plans in established decisions
- Signals when enough is known to plan: *"I think we have enough — want to explore anything else?"*
- You always decide when discovery is done

### 2. plan

Produces all artifacts needed for execution.

Artifacts are created in dependency order:

```
brief.md  →  design.md  →  specs/  →  tasks.md
```

Every task uses the **RED/ACTION/GREEN format** — no exceptions:

**Code tasks:**
```markdown
### 1. Add authentication middleware

RED:    Write failing test: unauthenticated request to /api/me returns 401
ACTION: Implement JWT middleware
GREEN:  Test passes
```

**Non-code tasks:**
```markdown
### 2. Write API documentation

RED:    docs/api.md does not contain sections "Auth", "Endpoints", "Errors"
ACTION: Write docs/api.md with all required sections
GREEN:  docs/api.md exists and contains all three sections
```

You review all artifacts before execution begins. You can adjust any assertion, action, or approach.

### 3. execute

Implements tasks one RED→GREEN cycle at a time.

- Reads all context (brief, design, specs, tasks, decisions) before starting
- If `evaluations.md` exists from a previous evaluate run, announces flagged gaps and focuses there first
- For each task: confirm RED fails → implement → verify GREEN passes → mark complete
- Pauses and reports on any blocker — never guesses
- Updates `decisions.md` when significant decisions are made during implementation

### 4. evaluate *(optional)*

An adversarial post-execute check inspired by the GAN discriminator pattern. Reads only the contract (`brief.md` + `specs/`) and the actual outputs — never `tasks.md` or `design.md` — and returns a structured verdict per capability.

- **Blind to implementation intent** — judges output against contract only
- **Adversarial by design** — looks for gaps, not confirmation
- Per-capability verdicts: `✅ SATISFIED` / `⚠️ PARTIAL` / `❌ UNSATISFIED` / `❓ UNCLEAR`
- Triage summary: *safe to skip / worth a look / human call*
- Appends a timestamped entry to `evaluations.md` — the full iteration history stays with the request
- Never a hard gate — always optional, always human-decided

---

## Artifact Structure

```
reespec/
  decisions.md                    ← shared decision log, all requests
  requests/
    <request-name>/
      brief.md                    ← what & why
      design.md                   ← how
      specs/
        <capability>/
          spec.md                 ← GIVEN/WHEN/THEN scenarios
      tasks.md                    ← RED/ACTION/GREEN checklist
      evaluations.md              ← append-only evaluation log (optional)
    archive/
      YYYY-MM-DD-<name>/          ← completed requests
```

---

## decisions.md — The Decision Log

A shared file that accumulates architectural and strategic decisions across all requests.

**What belongs:**
- Library or technology choices with rationale
- Architectural patterns adopted
- Approaches explicitly rejected and why
- Deviations from the original plan with explanation

**What does NOT belong:**
- Activity entries ("added X", "removed Y")
- Implementation details available in request artifacts

**Entry format:**
```markdown
### <Decision title> — YYYY-MM-DD (Request: <request-name>)

One paragraph. What was decided and why. What was considered
and rejected. See request artifacts for full context.
```

Entries are added by:
- You explicitly asking ("log that we chose library X")
- The agent detecting a significant decision during execution

The agent reads `decisions.md` at the start of every discover session to ground new plans in established decisions.

---

## CLI Commands

```
reespec init                        initialise reespec in current directory
reespec new request <name>          scaffold a new request
reespec list                        list active requests with status
reespec status --request <name>     show artifact status for a request
reespec archive --request <name>    archive a completed request
reespec update                      re-sync skills into installed harnesses
```

---

## Skills

Install the skills into your agent's skills directory:

```bash
cp -r .pi/skills/reespec-* ~/.pi/agent/skills/
# or wherever your agent loads skills from
```

| Skill | When to use |
|---|---|
| `reespec-discover` | Starting a new request or exploring a problem |
| `reespec-plan` | Producing artifacts after discovery |
| `reespec-execute` | Implementing tasks from a planned request |
| `reespec-evaluate` | Verifying implementation against the contract (optional, post-execute) |
| `reespec-archive` | Finalising and archiving a completed request |

---

## Example Request Walkthrough

**Human:** "I want to add a CSV export feature to the dashboard."

**→ discover phase**
Agent reads `decisions.md`, checks active requests, then:
> "What data should be exportable — all dashboard data, or specific sections?"

Human answers. Agent follows up:
> "Should the export be triggered by the user on demand, or scheduled automatically?"

...and so on, one question at a time, until both human and agent are confident a plan can be made.

**→ plan phase**
Agent produces:
- `brief.md` — CSV export for dashboard, scoped to on-demand user trigger
- `design.md` — use streaming response, Papa Parse on frontend
- `specs/csv-export/spec.md` — GIVEN user clicks export WHEN data loads THEN file downloads
- `tasks.md` — 4 tasks, each with RED/ACTION/GREEN

Human reviews, adjusts task 2 assertion, approves.

**→ execute phase**
Agent works through tasks:
1. RED: writes failing test for export endpoint → GREEN: endpoint returns CSV ✓
2. RED: export button missing from dashboard → GREEN: button added and wired ✓
3. RED: file has no headers → GREEN: headers present ✓
4. RED: docs missing export section → GREEN: docs updated ✓

All done. Agent suggests evaluate or archive.

**→ evaluate phase** *(optional)*
Agent reads `brief.md` + `specs/` as the contract, scans the outputs:
```
### csv-export-capability
verdict:  ⚠️ PARTIAL
reason:   brief says "include column headers" — export endpoint found but
          headers absent from test fixture in tests/export.test.mjs
focus:    tests/export.test.mjs — header assertion missing

## Triage
✅ Safe to skip:   streaming-response, frontend-button, docs
⚠️  Worth a look:  csv-export (missing header assertion)
```
Human fixes the gap, re-runs execute for that one task, evaluates again — all green.
Evaluation logged to `reespec/requests/add-csv-export/evaluations.md`.

**→ archive**
Request moves to `reespec/requests/archive/2026-03-20-add-csv-export/`
(includes `evaluations.md` — full iteration history travels with the request)

---

## Consistency

reespec's value proposition is **consistent agent behavior across all harnesses** — the same framework rules produce the same behavior whether you're using pi, Cursor, Claude.ai, or any other supported agent.

The `evals/` directory contains a [promptfoo](https://promptfoo.dev)-based eval suite that verifies this consistency programmatically and semantically.

### What the eval suite checks

**Four highest-priority failure modes:**

| Failure mode | How it's caught |
|---|---|
| Agent jumps to solutions in discover | Semantic judge: `no-premature-solution` |
| Multiple questions per turn in discover | Structural: question count per agent turn |
| Fake RED (vague assertion, not a real test) | Semantic judge: `real-red-assertion` |
| Fake GREEN (declared complete, not verified) | Semantic judge: `verified-green` |
| Cross-harness drift | Semantic judge: `cross-harness-drift` (run separately) |

### Public scenarios

Committed synthetic scenarios in `evals/public/`:

```
discover/
  01-vague-idea          user has fuzzy intent, agent must draw it out
  02-premature-solution  user proposes a solution early, agent must redirect
  03-multiple-threads    many open questions exist, agent must pick one

plan/
  01-code-request        standard feature request — RED must be a real test file
  02-noncode-request     documentation task — RED must be a binary assertion

execute/
  01-fake-green          agent must show test output before marking GREEN
  02-red-first           agent must write failing test before implementing
```

### Running evals

```bash
# Run full public suite (structural + semantic — requires OPENAI_API_KEY)
npm run eval

# Structural checks only — fast, free, CI-safe (no API key needed)
npm run eval:structural

# Semantic (LLM-judge) checks only — run before shipping framework changes
npm run eval:semantic

# Cross-harness comparison — side-by-side across providers
npm run eval:compare
```

**Structural checks** run automatically in CI on pushes that modify `skills/**` or `evals/public/**`.

**Semantic checks** require an `OPENAI_API_KEY` and are run locally on demand — they cost money and are non-deterministic, so they are not part of the CI gate.

### Private evals

You can run the eval suite against your own real interaction transcripts. See `evals/private/README.md` for the format — real sessions are formatted as `conversation.yaml` and labelled good/bad/borderline in `label.md`. The `evals/private/` directory is gitignored and never committed.

```bash
# Run private suite against labelled sessions (requires evals/private/sessions/)
npm run eval:private
```

---

## Philosophy

- **Better output is the primary goal** — traceability is valuable but secondary
- **No formal gates** — phases are fluid, you can loop back anytime
- **Approachable by anyone** — technical or not, solo or team
- **One question at a time** — in discover, always
- **Every task is verifiable** — RED/ACTION/GREEN, no exceptions
- **Evaluate is adversarial by design** — blind to intent, judges output against contract only
