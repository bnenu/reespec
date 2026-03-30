# Spec — verdict engine

## Capability

The evaluator reads a contract (brief + specs, or freeform text) and actual outputs,
then produces a structured verdict per spec capability with a triage summary. It is
adversarial by design — it tries to find gaps, not confirm success.

## Requirements

### Requirement: Contract isolation

- The evaluator SHALL read `brief.md` and `specs/` as the contract
- The evaluator SHALL NOT read `tasks.md`, `design.md`, or agent conversation history
- The evaluator SHALL treat the contract as the sole source of truth for what "done" means

### Requirement: Output scanning

- The evaluator SHALL scan actual outputs in the working directory
- For code outputs: the evaluator SHALL check file existence, run tests if available,
  inspect public interfaces
- For document outputs: the evaluator SHALL check file existence and content presence
- The evaluator SHALL infer output type from contract language — no explicit declaration required

### Requirement: Per-spec verdicts

- The evaluator SHALL produce one verdict block per spec capability
- Each verdict block SHALL contain:
  - A verdict label: SATISFIED / PARTIAL / UNSATISFIED / UNCLEAR
  - A reason anchored in specific contract language and/or file paths
  - A focus hint (for non-SATISFIED verdicts): where the human should look

#### Scenario: Spec is fully satisfied

- GIVEN a spec capability whose requirements are all present in the outputs
- WHEN the evaluator checks against the contract
- THEN it SHALL return `✅ SATISFIED`
- AND provide a one-line reason citing the relevant output

#### Scenario: Spec is partially satisfied

- GIVEN a spec capability where some requirements are present and some are absent
- WHEN the evaluator checks against the contract
- THEN it SHALL return `⚠️ PARTIAL`
- AND identify specifically which requirements are missing
- AND provide a focus hint pointing to the relevant location

#### Scenario: Spec is not satisfied

- GIVEN a spec capability with no evidence of implementation in the outputs
- WHEN the evaluator checks against the contract
- THEN it SHALL return `❌ UNSATISFIED`
- AND provide a focus hint pointing to where the implementation should be

#### Scenario: Contract is underspecified

- GIVEN a brief that mentions something but no spec defines it precisely
- WHEN the evaluator cannot determine pass/fail
- THEN it SHALL return `❓ UNCLEAR`
- AND note that the contract is underspecified, not that the implementation is wrong
- AND flag it as a human call in the triage summary

### Requirement: Triage summary

- The evaluator SHALL produce a triage summary after all verdict blocks
- The summary SHALL group specs into:
  - ✅ Safe to skip — SATISFIED specs the human need not review
  - ⚠️  Worth a look — PARTIAL or UNSATISFIED specs requiring human attention
  - ❓  Human call — UNCLEAR specs where the contract is underspecified
- The summary SHALL be the primary focus guidance output

### Requirement: Adversarial stance

- The evaluator SHALL actively look for gaps, not confirm success
- The evaluator SHALL NOT give benefit of the doubt — absence of evidence is flagged
- The evaluator SHALL NOT read implementation intent from excluded artifacts
- WHEN a spec requirement has no clear corresponding output
- THEN it SHALL flag it as PARTIAL or UNSATISFIED, not assume it is satisfied
