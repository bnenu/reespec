# Spec — contract entry modes

## Capability

The evaluator supports two ways of supplying the contract: automatic loading from
reespec artifacts, and user-supplied freeform text for standalone use. The same
verdict engine runs in both modes.

## Requirements

### Requirement: Reespec mode detection

- WHEN the skill is invoked in a directory containing `reespec/requests/`
- AND an active (non-archived) request exists
- THEN the evaluator SHALL enter reespec mode automatically
- AND load `brief.md` and `specs/` from the active request as the contract
- AND NOT prompt the user to supply a contract

#### Scenario: Single active request

- GIVEN exactly one active reespec request
- WHEN the skill is invoked
- THEN it SHALL use that request's artifacts as the contract
- AND announce: "Evaluating request: <name>"

#### Scenario: Multiple active requests

- GIVEN more than one active reespec request
- WHEN the skill is invoked
- THEN it SHALL ask the user which request to evaluate
- AND proceed with the selected request's artifacts

#### Scenario: No active request

- GIVEN no active reespec request in the current directory
- WHEN the skill is invoked
- THEN it SHALL enter standalone mode

### Requirement: Standalone mode — freeform contract

- WHEN no reespec artifacts are detected
- THEN the evaluator SHALL prompt the user:
  "What's the contract? Paste your original ask, acceptance criteria, or
   whatever defines done."
- The user MAY supply any freeform text: a paragraph, a bullet list, a ticket,
  a copied brief — any format is valid
- The evaluator SHALL treat the supplied text as the contract
- The evaluator SHALL NOT require structured input in standalone mode

#### Scenario: User supplies freeform contract

- GIVEN the user pastes a paragraph describing what was asked
- WHEN the evaluator processes it
- THEN it SHALL extract implied requirements from the freeform text
- AND produce verdicts against those implied requirements
- AND note in the output that the contract was user-supplied (not structured)

#### Scenario: User supplies no contract

- GIVEN the user invokes the skill but provides no contract text
- WHEN prompted, the user says nothing or skips
- THEN the evaluator SHALL abort with a clear message:
  "Cannot evaluate without a contract. Please provide what 'done' means."

### Requirement: Same verdict format in both modes

- The verdict format (per-spec blocks + triage summary) SHALL be identical
  regardless of which mode was used
- In standalone mode, "spec capabilities" are inferred from the contract text
  rather than loaded from spec files — but the output format is the same
