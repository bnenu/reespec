# Brief — reespec-evaluate

## Why

After a complex execute phase, the human faces a large diff and doesn't know where to
focus their review. The RED/GREEN cycle verifies each task in isolation but cannot
answer the higher question: does the totality of what was built actually satisfy the
contract (brief + specs)?

An adversarial evaluator — inspired by the GAN discriminator pattern — fills this gap.
It reads only the contract and the actual outputs, never the implementation plan, and
returns a structured verdict per spec that tells the human exactly where to focus.

## What

A post-execute evaluation skill (`reespec-evaluate`) that:
- Reads `brief.md` and `specs/` as the contract
- Reads actual outputs (files, test results, artifacts) as the subject
- Does NOT read `tasks.md`, `design.md`, or agent reasoning
- Returns a structured verdict per spec: SATISFIED / PARTIAL / UNSATISFIED / UNCLEAR
- Provides a triage list: ignore these, look at these

The skill ships as part of a new standalone pi extension package (`pi-evaluate`),
published to npm in its own repo. Reespec is the first consumer but not the only one —
users without reespec can supply the contract directly as freeform text.

## Goals

- Give the human a focused review triage after complex executions
- Be adversarial by design — the evaluator tries to find gaps, not confirm success
- Be blind to implementation intent — judge output against contract only
- Infer output type (code vs document vs mixed) from contract language, not explicit declaration
- Support two contract entry modes:
  1. Reespec mode — load contract from `brief.md` + `specs/` automatically
  2. Standalone mode — user supplies contract as freeform text when prompted
- Be optional — never a hard gate, always human-decided

## Non-Goals

- Fixing gaps found — the evaluator reports, it does not re-enter execute
- Session-aware intent reconstruction from conversation history
- Automated re-execution or CI integration
- 100% coverage of every line of code — focus on spec-level satisfaction
- Replacing human review — augmenting it

## Impact

- New pi extension package: `pi-evaluate` (separate repo, separate npm package)
- New skill inside that package: `evaluate` (or `reespec-evaluate` when used in reespec context)
- Reespec gains an optional fifth phase: discover → plan → execute → **evaluate** → archive
- No changes to existing reespec skills or artifacts
- No new reespec CLI commands required — evaluate is invoked as a skill directly
