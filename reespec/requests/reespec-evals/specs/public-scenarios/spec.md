# Spec — public scenarios

## Capability

A committed set of synthetic but realistic eval scenarios that cover the four
highest-priority failure modes across all three reespec phases.

## Requirements

### Requirement: Scenario coverage

- The public suite SHALL include at least one scenario per failure mode:
  1. Cross-harness drift
  2. Agent jumps to solutions in discover
  3. Fake RED (vague assertion)
  4. Fake GREEN (declared not verified)
- The public suite SHALL include scenarios for all three phases: discover, plan, execute

### Requirement: Discover scenarios

#### Scenario: Vague idea

- GIVEN a user turn with vague intent ("I want to improve my workflow")
- WHEN the agent responds
- THEN the structural check SHALL verify the agent turn contains ≤1 question
- AND the semantic check SHALL verify the agent did NOT propose a solution

#### Scenario: Premature solution

- GIVEN a user who immediately proposes a specific solution ("just add a webhook")
- WHEN the agent responds
- THEN the semantic check SHALL verify the agent explored the problem before accepting the solution
- AND the structural check SHALL verify the agent asked exactly 1 question

#### Scenario: Multiple open threads

- GIVEN a conversation with several unresolved threads
- WHEN the agent has multiple valid questions it could ask
- THEN the structural check SHALL verify it asked only ONE question in its turn

### Requirement: Plan scenarios

#### Scenario: Code request with RED/GREEN

- GIVEN a plan task for a code feature
- WHEN the agent produces tasks.md
- THEN every task SHALL contain `**RED**`, `**ACTION**`, `**GREEN**` keywords
- AND the semantic check SHALL verify RED describes a real runnable test, not a description

#### Scenario: Non-code request with binary assertion

- GIVEN a plan task for documentation or config
- WHEN the agent produces tasks.md
- THEN the RED assertion SHALL be specific and binary (not "documentation is clear")
- AND the semantic check SHALL verify the assertion is agent-verifiable

### Requirement: Execute scenarios

#### Scenario: RED before implementation

- GIVEN a task transcript where the agent is executing a code task
- WHEN the agent starts the task
- THEN the structural check SHALL verify RED step appears before ACTION in the transcript
- AND the semantic check SHALL verify the agent wrote a test, not just described one

#### Scenario: GREEN verification

- GIVEN a task transcript where the agent claims the task is complete
- WHEN the agent marks the task `[x]`
- THEN the semantic check SHALL verify the agent ran the test or re-checked the assertion
- AND SHALL NOT accept "this should pass" as a GREEN verification

### Requirement: Scenario realism

- Each scenario SHALL be realistic enough that a real agent behaves naturally
- Scenarios SHALL NOT be trivially easy (single obvious pass) or adversarially hard
- Each scenario SHALL have a human-readable description of what it is testing and why

### Requirement: Scenario authoring process

- GIVEN a new scenario is needed
- WHEN it is authored
- THEN an LLM SHALL draft the initial `conversation.yaml` and `criteria.md`
- AND a human SHALL review and refine before the scenario is committed
- AND the scenario SHALL include a comment block noting what failure mode it exercises
