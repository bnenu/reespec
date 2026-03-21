# Spec — decision log

## Capability

A shared, persistent record of architectural and strategic decisions made across all requests. Serves both human readers and agents being primed with context for new requests.

## Requirements

### Requirement: Single shared file

- The decision log SHALL live at `reespec/decisions.md`
- It SHALL be shared across all requests — not scoped to any single request
- It SHALL persist across request lifecycle (survives archiving of requests)

### Requirement: Entry format

- Each entry SHALL follow this format:
  ```markdown
  ### <Decision title> — <YYYY-MM-DD> (Request: <request-name>)
  
  <One paragraph. What was decided and why. What was considered
  and rejected. Reference the request for full context.>
  ```
- Entries SHALL be as small as possible — one decision, one paragraph
- Entries SHALL reference the relevant request for detail, not duplicate it

### Requirement: Entry triggers

#### Scenario: Human-requested entry

- GIVEN the human says "log that we decided X"
- THEN the agent SHALL create an entry immediately
- AND the entry SHALL reflect what the human described

#### Scenario: Agent-detected significant decision

- GIVEN the agent makes a non-obvious implementation choice during execute
- OR GIVEN the agent deviates from the plan in a significant way
- OR GIVEN a previous decision is reversed or superseded
- THEN the agent SHALL add an entry to decisions.md
- AND the entry SHALL describe the decision and its rationale

### Requirement: What belongs

- Library or technology choices with rationale
- Architectural patterns adopted
- Approaches explicitly rejected and why
- Deviations from the original plan with explanation
- Decisions that constrain future work

### Requirement: What does not belong

- Activity entries ("added X", "removed Y", "refactored Z")
- Implementation details available in request artifacts
- Decisions too small to affect future planning or agent context

### Requirement: Agent consultation

- WHEN starting a discover phase for a new request
- THEN the agent SHALL read decisions.md before asking questions
- The agent SHALL use existing decisions to ground new plans
- The agent SHALL flag when a proposed direction contradicts an existing decision

### Requirement: Human control

- The human MAY edit or delete any entry at any time
- The agent SHALL NOT treat decisions.md as immutable
- The agent SHALL respect manual edits made by the human
