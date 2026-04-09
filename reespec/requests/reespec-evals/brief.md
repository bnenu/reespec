# Brief — reespec-evals

## Why

The reespec framework promises consistent, structured human-agent collaboration across
all phases (discover, plan, execute) and across all supported harnesses (pi, cursor,
claude, etc.). Without a way to verify that promise, users cannot trust it and adoption
is hard to justify. Framework changes risk silent regressions with no way to detect them.

## What

An eval suite using promptfoo that verifies reespec agent behavior against the framework
spec. Two tiers: a public suite committed to the repo with synthetic scenarios, and a
private suite using real interaction transcripts that stays local and gitignored.

## Goals

- Detect the four highest-priority failure modes:
  1. Cross-harness drift — agent behaves differently on pi vs cursor vs claude
  2. Agent jumps to solutions in discover before understanding the problem
  3. Fake RED — task has `RED:` keyword but assertion is vague, not a real test
  4. Fake GREEN — task marked complete without actually verifying the assertion
- Provide a regression baseline: run before and after any framework change
- Give new users proof of consistency without requiring them to take it on faith
- Keep private evals private — real project data never enters the public repo

## Non-Goals

- Building a custom eval runner — adopt promptfoo, don't invent infrastructure
- 100% coverage of every framework rule — focus on the highest-impact failure modes
- Real-time monitoring of live agent sessions
- Automating the human review step in discover or plan phases

## Approach

Two-tier eval suite, shared infrastructure:

```
evals/
  public/          ← committed to repo, CI-safe
    discover/      ← scripted multi-turn conversations
    plan/
    execute/
  private/         ← gitignored, local only
    sessions/      ← real transcripts, labelled good/bad
  promptfoo.yaml   ← shared config
```

**Public evals**: scripted multi-turn conversations with a synthetic user. LLM drafts
the scenarios, human reviews and refines before committing. Two scoring layers:
- Structural (programmatic): question count per turn, RED/ACTION/GREEN keyword presence,
  artifact order
- Semantic (LLM-as-judge): fake RED detection, fake GREEN detection, premature solution
  jumping, cross-harness drift comparison

**Private evals**: real transcripts from existing sessions, labelled good/bad/borderline.
Same runner and scorers as public. Gitignored. Used as ground truth for tuning the
LLM-judge prompts and as personal regression tests before shipping changes.

**Three-step rollout**:
1. Build the eval framework (promptfoo config, scorers, scenario format)
2. Label existing real sessions → private eval dataset
3. Synthesize public scenarios from patterns in labelled private data

## Impact

- New `evals/` directory at repo root
- `evals/private/` added to `.gitignore`
- promptfoo added as a dev dependency
- New npm script: `npm run eval` (public suite), `npm run eval:private` (private suite)
- CI workflow updated to run public structural checks on relevant file changes
- `README.md` updated with a "Consistency" section linking to eval results
