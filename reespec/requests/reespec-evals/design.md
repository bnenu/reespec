# Design — reespec-evals

## Context

reespec's value proposition is behavioral consistency across harnesses and interaction
types. This design describes an eval suite that verifies that consistency programmatically
and semantically, using promptfoo as the eval runner.

The suite has two tiers — public (committed, CI-safe) and private (gitignored, local) —
that share the same runner, format, and scorers but differ in data provenance.

## Directory Structure

```
evals/
  public/
    discover/
      01-vague-idea/
        conversation.yaml      ← scripted multi-turn input
        criteria.md            ← what this scenario must satisfy
      02-specific-problem/
        ...
      03-mid-execution-discovery/
        ...
    plan/
      01-code-request/
        ...
      02-noncoe-request/
        ...
    execute/
      01-code-task-red-green/
        ...
      02-nonccode-task-assertion/
        ...
  private/                     ← gitignored
    sessions/
      YYYY-MM-DD-<slug>/
        conversation.yaml      ← real transcript, formatted as eval input
        criteria.md
        label.md               ← good / bad / borderline + notes
  promptfoo.yaml               ← shared config: providers, default judge prompt
  judges/
    one-question-per-turn.md   ← reusable LLM judge prompt
    no-premature-solution.md
    real-red-assertion.md
    verified-green.md
    cross-harness-drift.md
```

## Eval Case Format

Every eval case — public or private — has the same two files:

**conversation.yaml** — the scripted input fed to promptfoo:
```yaml
- role: system
  content: <the reespec skill prompt for this phase>
- role: user
  content: <first human turn>
- role: assistant
  content: <scripted agent response, or omitted for live runs>
- role: user
  content: <second human turn>
...
```

For public evals the conversation is fully scripted (deterministic input).
For private evals it is a real transcript replayed.

**criteria.md** — plain-text scoring criteria consumed by the LLM judge:
```markdown
## Structural checks (programmatic)
- Each agent turn contains at most 1 question mark at the end of a sentence
- ...

## Semantic checks (LLM-judge)
- The agent did NOT propose a solution before understanding the problem
- ...
```

## Two Scoring Layers

### Layer 1 — Structural (programmatic, CI)

Fast checks on the raw text of agent responses. Run on every relevant push.

| Check | Method | Phase |
|---|---|---|
| ≤1 question per agent turn | Count `?` in agent turns | discover |
| RED keyword present in every task | Regex `^- \[ \] \*\*RED\*\*` | plan |
| ACTION keyword present | Regex | plan |
| GREEN keyword present | Regex | plan |
| Artifacts produced in order | File existence sequence check | plan |
| Task marked complete only after GREEN | Checkbox state sequence | execute |

Implemented as promptfoo `assert` blocks with `type: javascript` or `type: regex`.

### Layer 2 — Semantic (LLM-as-judge, on demand)

Slower checks that require understanding intent, not just structure. Run manually
before shipping framework changes, not on every push (cost and latency).

| Check | Judge prompt | Failure mode caught |
|---|---|---|
| One real question, not multiple embedded | `one-question-per-turn.md` | Multiple questions disguised as one |
| No premature solution | `no-premature-solution.md` | Agent jumps to answers |
| RED is a real assertion | `real-red-assertion.md` | Fake RED (vague description) |
| GREEN was actually verified | `verified-green.md` | Fake GREEN (declared not checked) |
| Consistent across harnesses | `cross-harness-drift.md` | Cross-harness drift |

Each judge prompt follows the same structure:
```markdown
You are evaluating an AI agent's response against the reespec framework spec.

## Criterion
<what to check — one criterion per judge>

## The agent's response
{{output}}

## Verdict
Respond with PASS or FAIL followed by one sentence of reasoning.
```

## Cross-Harness Comparison

The same eval case is run against multiple providers (pi, cursor-simulated, claude-direct).
promptfoo's built-in model comparison produces a side-by-side table. Drift is flagged when:
- Structural score differs across providers for the same scenario
- LLM judge scores PASS on one provider and FAIL on another

This is run as a separate `npm run eval:compare` script, not in CI.

## Public Scenario Design

Public scenarios are synthetic but realistic. They cover:

```
discover/
  01-vague-idea          user has fuzzy intent, agent must draw it out
  02-specific-problem    user has a clear problem, agent must not over-explore
  03-premature-solution  user proposes a solution early, agent must redirect
  04-multi-thread        several open questions exist, agent must pick one

plan/
  01-code-request        standard feature request, all tasks must have real tests
  02-noncode-request     documentation/config task, assertions must be binary
  03-mixed-request       code + noncode tasks in same plan

execute/
  01-red-first           agent must write failing test before implementing
  02-green-verification  agent must run test, not just declare pass
  03-blocker-handling    ambiguous task, agent must pause not guess
```

Scenario authoring process:
1. LLM drafts conversation transcript and criteria
2. Human reviews — checks realism, edge cases, difficulty calibration
3. Human refines and commits

## Private Eval Workflow

Three-step rollout (post-framework-build):

**Step 1 — Export real sessions**
Real interactions from pi/cursor/claude are manually formatted into `conversation.yaml`.
Each session gets a `label.md` with: overall rating (good/bad/borderline), notes on
which specific checks passed or failed, and why.

**Step 2 — Run and tune**
Run private evals with framework. Compare LLM judge scores against manual labels.
Where scores disagree, refine the judge prompts. Iterate until judge scores match
human labels on ≥80% of labelled cases.

**Step 3 — Synthesize public cases**
From patterns in labelled private data, draft public scenarios that exercise the same
failure modes without containing real project data. These are the committed scenarios.

## CI Integration

```yaml
# .github/workflows/evals.yml
on:
  push:
    paths:
      - 'skills/**'
      - 'evals/public/**'
      - 'promptfoo.yaml'

jobs:
  evals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run eval:structural
```

Only structural (programmatic) checks run in CI. Semantic (LLM-judge) checks require
an API key and cost money — run locally on demand via `npm run eval:semantic`.

## Key Design Decisions

### promptfoo over custom runner
promptfoo provides multi-turn conversation support, LLM-as-judge, model comparison,
and CI integration out of the box. Building custom infrastructure would cost more and
provide less. The eval cases are just YAML files — not locked into promptfoo forever.

### Two tiers, same format
Public and private evals use identical file formats and the same runner config.
The only difference is that `evals/private/` is gitignored. This means the private
workflow is identical to the public one — no separate tooling to learn or maintain.

### Structural checks in CI, semantic checks on demand
Structural checks are fast, cheap, and deterministic — appropriate for CI. Semantic
checks (LLM-judge) cost money and are non-deterministic — appropriate for pre-release
validation, not every push.

### Judge prompts are files, not inline config
Each LLM judge criterion lives in its own `judges/*.md` file. This makes them readable,
reviewable, and improvable independently of the promptfoo config. The judge prompts are
themselves part of the eval framework's quality.

### Private evals are ground truth, public evals are derived
The labelling of real private sessions establishes what "good" and "bad" look like.
Public synthetic scenarios are derived from those patterns. This ordering ensures
public scenarios test real failure modes, not imagined ones.

## Risks

- **Judge prompt quality** — a poorly written LLM judge will produce noisy scores.
  Mitigation: tune against labelled private data until ≥80% agreement with human labels.
- **Scenario realism** — synthetic public scenarios may be too easy or too artificial.
  Mitigation: human review of every scenario before commit; derive from real data.
- **Cost of semantic evals** — LLM-judge calls cost money at scale.
  Mitigation: structural checks in CI (free), semantic checks on demand only.
- **Transcript format friction** — converting real sessions to eval format is manual.
  Mitigation: document the format clearly; keep it simple (plain YAML, no tooling).
