# Spec — plan phase

## Capability

The plan phase produces all artifacts needed for execution of a request: brief, design, specs, and tasks. Every task has a verifiable RED/ACTION/GREEN structure regardless of task type.

## Requirements

### Requirement: Artifact production order

- The agent SHALL produce artifacts in dependency order
- brief.md SHALL be produced first (or verified to exist from discover)
- design.md SHALL be produced after brief.md, reading it for context
- specs/ SHALL be produced after design.md, reading brief and design for context
- tasks.md SHALL be produced last, reading all above for context
- The agent SHALL read each dependency artifact before producing the next

### Requirement: Universal task format

- Every task in tasks.md SHALL follow the RED/ACTION/GREEN format
- No task SHALL be written as a plain checklist item without assertions

#### Scenario: Code task format

- GIVEN a task that involves writing or changing code
- THEN the task SHALL have the form:
  ```
  RED:    Write failing test for <behavior>
  ACTION: Implement <what>
  GREEN:  Test passes
  ```
- AND the RED step SHALL be a real failing test, not a description

#### Scenario: Non-code task format

- GIVEN a task that does not involve code
- THEN the task SHALL have the form:
  ```
  RED:    <observable assertion that currently fails>
  ACTION: <what the agent will do>
  GREEN:  Verify assertion passes
  ```
- AND the assertion SHALL be agent-verifiable where possible
- AND human-verifiable assertions SHALL only be used as a last resort

### Requirement: Assertion derivation

- The agent SHALL derive assertions from discovery artifacts and conversation context
- Assertions SHALL be specific enough to be unambiguously pass/fail
- Vague assertions such as "documentation is clear" SHALL NOT be used
- The discovery phase SHALL have produced enough detail for specific assertions

### Requirement: TDD discipline for code tasks

- Code tasks SHALL follow vertical slices: one test → one implementation → repeat
- Tests SHALL verify behavior through public interfaces, not implementation details
- The agent SHALL NOT write all tests first then all implementations (horizontal slicing)

### Requirement: Human review gate

- The agent SHALL present all artifacts to the human before execution begins
- The human SHALL be able to adjust any assertion, action, or approach
- The human MAY state "done means X, Y, Z" and the agent SHALL map this to assertions
- Execution SHALL NOT begin until the human approves the plan

### Requirement: Artifact quality

- brief.md SHALL include: what, why, scope, goals, non-goals, impact
- design.md SHALL include: decisions, tradeoffs, approach, risks
- specs/ SHALL include: GIVEN/WHEN/THEN scenarios per capability
- tasks.md SHALL include: RED/ACTION/GREEN per task, grouped logically
