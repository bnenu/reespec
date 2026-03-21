# Spec — execute phase

## Capability

The execute phase implements tasks from a planned request, one RED→GREEN cycle at a time, with the agent pausing on blockers and updating the decision log when significant choices are made.

## Requirements

### Requirement: Context reading

- The agent SHALL read all context artifacts before starting any task
- Context SHALL include: brief.md, design.md, specs/, tasks.md, decisions.md
- The agent SHALL NOT begin implementation without reading full context

### Requirement: Vertical slice execution

- The agent SHALL work through tasks one at a time in order
- For each task the agent SHALL: run RED check → implement → verify GREEN
- The agent SHALL NOT begin a new task until the current task's GREEN passes
- The agent SHALL mark each task complete (`- [ ]` → `- [x]`) immediately after GREEN

### Requirement: RED enforcement

- For code tasks: the agent SHALL write the failing test before any implementation
- For non-code tasks: the agent SHALL verify the assertion fails before starting
- The agent SHALL NOT skip the RED step

### Requirement: GREEN verification

- For code tasks: the agent SHALL run the test and confirm it passes
- For non-code tasks: the agent SHALL re-check the assertion and confirm it passes
- The agent SHALL NOT mark a task complete without verified GREEN

### Requirement: Pause conditions

- The agent SHALL pause and report when:
  - A task is ambiguous or contradicts the design
  - Implementation reveals a design issue not anticipated in planning
  - A blocker is encountered that cannot be resolved autonomously
  - The human interrupts
- The agent SHALL NOT guess or proceed past a blocker

### Requirement: Decision log updates

- WHEN execution reveals a significant decision, deviation, or non-obvious choice
- THEN the agent SHALL add an entry to `decisions.md`
- The agent SHALL NOT add activity log entries ("added X", "removed Y")
- Entries SHALL follow the format: title, date, request reference, one paragraph

### Requirement: Progress reporting

- The agent SHALL report progress as "N/M tasks complete"
- The agent SHALL show which task is currently being worked on
- The agent SHALL suggest archive when all tasks are complete

### Requirement: Artifact updates

- WHEN execution reveals a design issue
- THEN the agent SHALL suggest updating design.md or brief.md
- The agent SHALL NOT silently deviate from the plan without updating artifacts
