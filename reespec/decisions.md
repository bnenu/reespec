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

### Adopt promptfoo as the eval runner — 2026-03-24 (Request: reespec-evals)

promptfoo was chosen over building a custom eval runner and over alternatives (braintrust, inspect-ai, deepeval). Key reasons: YAML-based eval cases are just files with no vendor lock-in, multi-turn conversation support is built in, LLM-as-judge and model comparison are first-class features, and CI integration works out of the box with `npx promptfoo eval`. Braintrust requires an account for full functionality; inspect-ai is Python-first and heavier; deepeval is closer but has more complex setup. promptfoo's design matches the reespec use case directly.

### Two-tier eval structure: public committed, private gitignored — 2026-03-24 (Request: reespec-evals)

The eval suite is split into a public tier (synthetic scenarios committed to the repo) and a private tier (real interaction transcripts, gitignored). Both tiers use identical file formats and the same promptfoo runner — the only difference is that `evals/private/` is in `.gitignore`. This separation allows real project data to be used for ground-truth calibration without ever entering the public repo. The private tier is also the personal regression baseline before shipping framework changes.

### Structural checks in CI, semantic checks on demand — 2026-03-24 (Request: reespec-evals)

Programmatic structural checks (keyword presence, question count, artifact order) run in CI on every relevant push — they are fast, free, and deterministic. LLM-as-judge semantic checks (fake RED detection, fake GREEN detection, premature solution jumping) run locally on demand only. This split is driven by cost (LLM calls at CI scale add up), non-determinism (judge scores vary slightly across runs), and latency (semantic checks are slower). The CI gate catches regressions on structure; semantic checks are the pre-release quality bar.
