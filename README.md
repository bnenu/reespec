# reespec

A human-agent collaboration framework for expressing intent, planning work, and tracing decisions over time.

---

## What is reespec?

reespec structures how humans and AI agents work together through three phases:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   discover    │────▶│     plan      │────▶│    execute    │
│               │     │               │     │               │
│ explore the   │     │ produce all   │     │ implement one │
│ problem space │     │ artifacts with│     │ RED→GREEN     │
│ one question  │     │ verifiable    │     │ cycle at a    │
│ at a time     │     │ assertions    │     │ time          │
└───────────────┘     └───────────────┘     └───────────────┘
```

**Two goals:**
1. Help humans express their intentions more completely so agent output is better
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

# 6. archive when done
reespec archive --request "add-user-auth"
```

---

## The Three Phases

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
- For each task: confirm RED fails → implement → verify GREEN passes → mark complete
- Pauses and reports on any blocker — never guesses
- Updates `decisions.md` when significant decisions are made during implementation

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

All done. Agent suggests archive.

**→ archive**
Request moves to `reespec/requests/archive/2026-03-20-add-csv-export/`

---

## Philosophy

- **Better output is the primary goal** — traceability is valuable but secondary
- **No formal gates** — phases are fluid, you can loop back anytime
- **Approachable by anyone** — technical or not, solo or team
- **One question at a time** — in discover, always
- **Every task is verifiable** — RED/ACTION/GREEN, no exceptions
