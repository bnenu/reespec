# Decisions

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

### Universal RED/ACTION/GREEN task format — 2026-03-20 (Request: reespec-framework)

Every task in a reespec plan — code or non-code — uses the same RED/ACTION/GREEN skeleton. For code tasks, RED is a failing test. For non-code tasks, RED is an agent-verifiable observable assertion (e.g. "file contains section X"). Human-verifiable assertions are allowed as a last resort. This replaces plain checklist tasks and closes the gap where non-code tasks had no verifiable acceptance criteria. See reespec-framework design.md for full rationale.

### One question at a time in discover — 2026-03-20 (Request: reespec-framework)

The discover phase asks exactly one question per turn and waits for the answer before proceeding. Multiple simultaneous questions overwhelm the human and produce lower-quality answers. This rule emerged directly from the discovery session that produced reespec itself, where presenting multiple questions at once was identified as a friction point. It is the single most important rule of the discover phase.

### decisions.md as shared cross-request log — 2026-03-20 (Request: reespec-framework)

A single `reespec/decisions.md` file is shared across all requests rather than being scoped per request. This serves both human readers (browsable architectural history) and agents (context priming at the start of new discover sessions). Entries are intentionally small — one decision, one paragraph — with a reference to the request for full context. The file is not an activity log; only decisions that constrain future work belong here.

### Build on openspec's CLI and skill skeleton — 2026-03-20 (Request: reespec-framework)

reespec reuses openspec's operational model (CLI scaffold, artifact dependency order, archiving, skill structure) rather than inventing new infrastructure. The content model is replaced — new artifact names (brief, design, specs, tasks), new phase names (discover, plan, execute), new task format (RED/ACTION/GREEN) — but the underlying mechanics are inherited. This reduces implementation cost and preserves proven practices. The two frameworks can coexist in the same project.
