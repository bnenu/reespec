# Design — reespec Framework

## Context

reespec is a human-agent collaboration framework. It structures work into three phases — discover, plan, execute — each backed by a skill that agents load on demand. The CLI scaffolds requests and provides helper scripts; the human interacts entirely through the agent.

The design builds on openspec's proven operational skeleton (CLI commands, artifact creation order, archiving) while replacing its content model with reespec's approach.

## Artifact Structure

```
reespec/
  decisions.md                         ← shared decision log, all requests
  requests/
    <request-name>/
      brief.md                         ← what & why (scope, goals, non-goals)
      design.md                        ← how (decisions, tradeoffs, approach)
      specs/                           ← capability specs, GIVEN/WHEN/THEN
        <capability>/
          spec.md
      tasks.md                         ← implementation checklist, RED/ACTION/GREEN
    archive/
      YYYY-MM-DD-<request-name>/       ← completed requests
```

## CLI Commands

reespec mirrors openspec's command structure with reespec naming:

```
reespec new request "<name>"           scaffold a new request directory
reespec status --request "<name>"      show artifact completion status
reespec list                           list active requests
reespec instructions <artifact>        get agent instructions for an artifact
```

## The Three Phase Skills

### reespec-discover

**Stance**: warm thinking partner that challenges the human to explore all sides.

- Opens threads freely — diagrams, analogies, analogies, codebase investigation
- Tightens into grill-me pressure as clarity emerges — resolves every branch of the decision tree
- Asks **one question at a time**, waits for answer before proceeding to next
- Agent detects saturation ("I think we have enough to plan — want to explore anything else?")
- Human always has final say on when discovery is done
- No formal gate — goal is shared confidence that a plan can be made and implementation will match intent
- May read existing `decisions.md` and request artifacts for context
- Offers to capture insights into brief.md or decisions.md when they crystallize — human decides
- Never writes code or implements features

**Inherits from**: openspec-explore (thinking partner stance, codebase investigation, ASCII diagrams) + grill-me (relentless branch resolution, one question at a time)

### reespec-plan

**Stance**: structured artifact producer with human review gate.

Produces artifacts in dependency order:
1. `brief.md` — if not already created during discover
2. `design.md` — reads brief for context
3. `specs/` — reads brief + design for context
4. `tasks.md` — reads all above for context

**Universal task format** — every task, code or non-code:

```markdown
### <N>. <Task title>

RED:    <assertion that currently fails>
ACTION: <what the agent will do>
GREEN:  <verify the assertion now passes>
```

For **code tasks**:
- RED = write a failing test (TDD red)
- Tests must verify behavior through public interfaces, not implementation details
- One test → one implementation → repeat (vertical slices, never horizontal)
- GREEN = test passes

For **non-code tasks**:
- RED = agent-verifiable observable assertion derived from discovery artifacts
  - Examples: "report.md contains section 'ADN Segmentation'",
    "API returns 200 for endpoint /health", "word count > 500"
- GREEN = agent re-checks assertion, confirms it passes
- Human-verifiable assertion ("stakeholder approves") allowed as last resort
- Discovery phase should have uncovered enough detail to make assertions specific

Human reviews all artifacts before execution. Can adjust:
- Any assertion ("that's not what done looks like")
- The proposed action ("use approach X not Y")
- Task scope ("split this into two")
- Or explicitly state "done means X, Y, Z"

**Inherits from**: openspec-propose (artifact dependency order, read before write, verify file exists) + TDD skill (vertical slices, behavior not implementation, red-green-refactor)

### reespec-execute

**Stance**: vertical slice implementer, one RED→GREEN cycle at a time.

- Reads all context artifacts (brief, design, specs, tasks) before starting
- Works through tasks in order, one at a time
- For each task: run RED check → implement → verify GREEN
- Marks task complete (`- [ ]` → `- [x]`) immediately after GREEN passes
- Pauses on blockers, unclear requirements, or design issues — never guesses
- Suggests updating design.md or decisions.md if execution reveals something significant
- Reports progress: "N/M tasks complete"
- Suggests archive when all tasks complete

**Inherits from**: openspec-apply (context reading, task iteration, pause on blockers, progress reporting)

### reespec-archive

**Stance**: clean completion with traceability check.

- Warns on incomplete tasks, confirms before proceeding
- Syncs delta specs to main specs if applicable
- Date-stamps archive: `YYYY-MM-DD-<request-name>`
- Shows clear summary of what was done

**Inherits from**: openspec-archive (completion checking, spec sync, date-stamped archive)

## decisions.md — The Decision Log

Shared file at `reespec/decisions.md`, not scoped to any single request.

**Purpose**: records architectural and strategic decisions for future humans and agents to consult. Not an activity log — only what matters for future decisions.

**Entry format**:
```markdown
### <Decision title> — <YYYY-MM-DD> (Request: <request-name>)

<One paragraph. What was decided and why. What was considered and rejected.
Reference the request artifacts for full context.>
```

**Triggers for a new entry**:
- Human explicitly asks ("log that we switched to library X")
- Agent detects a significant decision during execution — a non-obvious choice, a deviation from the plan, or a change that affects future work
- Agent detects a previous decision has been reversed or superseded

**What belongs**:
- Library or technology choices and their rationale
- Architectural patterns adopted
- Approaches explicitly rejected and why
- Deviations from the plan discovered during execution

**What does not belong**:
- Activity log entries ("added X", "removed Y", "refactored Z")
- Implementation details that belong in the request artifacts
- Anything a future agent or human wouldn't need to make a good decision

**Agent usage**: during discover phase, agent consults `decisions.md` to ground new plans in existing decisions and avoid contradicting established patterns.

## Key Design Decisions

### Build on openspec's CLI skeleton, not from scratch
openspec's CLI (scaffold, status, list, instructions, archive) is proven and functional. reespec reuses this operational model with renamed commands and a new artifact schema. This avoids reinventing infrastructure and keeps the transition cost low.

### Primary goal is better output, not traceability
When these goals conflict — e.g. an assertion that would help traceability but adds friction to the human — optimize for better output. Traceability is valuable but secondary.

### No formal gates between phases
The human can move between discover, plan, and execute fluidly. The agent supports looping back — discovery can happen mid-execution when something unexpected surfaces. The only soft gate is shared confidence, not a system check.

### Universal RED/ACTION/GREEN task format
The same skeleton for every task eliminates the ambiguity of "what does done look like?" Non-code tasks are not second-class — they get the same assertion discipline as code tasks. This is the core contribution of reespec over openspec.

### decisions.md is agent-written, human-curated
The agent writes entries automatically when it detects significance. The human can request entries or delete/edit ones that don't belong. No approval gate on writing — friction kills traceability. But the human always has final control over the log's content.

### One question at a time in discover
This is a direct lesson from the discovery session that produced reespec itself. Multiple simultaneous questions overwhelm the human and produce lower-quality answers. One question → one answer → next question produces better discovery outcomes.

## Risks

- **Assertion quality** — agent-derived assertions for non-code tasks may be too weak or too mechanical. Mitigation: human review gate before execution; discovery phase should surface enough detail for good assertions.
- **decisions.md noise** — if the agent logs too many entries, the file becomes an activity log and loses its value. Mitigation: clear "what does not belong" guidance in the skill.
- **Discover phase length** — the grill-me approach can feel exhausting for simple requests. Mitigation: agent detects saturation early for simple cases; human can always cut discovery short.
