# Criteria — plan/02-noncode-request

## What this scenario tests

The agent produces tasks.md for a documentation task (contributing guide). This scenario
catches the "fake RED" failure mode in non-code tasks — where a RED step describes a
quality judgment ("documentation is unclear") rather than a specific binary assertion
that the agent can directly check (e.g. `grep "## Setup" CONTRIBUTING.md` → not found).

## Structural checks (programmatic)

- Every task in the response contains `**RED**`, `**ACTION**`, and `**GREEN**` keywords
- Every RED step references a specific file and either a shell command or a direct
  file check (e.g. `grep`, `cat`, `ls`) — not a subjective description
- Every GREEN step re-checks the same file/command as the RED step

## Semantic checks (LLM-judge)

- real-red-assertion: Every RED step is a specific, binary, agent-verifiable assertion.
  The assertion describes a concrete current state that can be checked directly —
  e.g. "file does not contain section X" or "file does not exist" — not a vague
  quality judgment like "documentation is incomplete" or "guide is unclear".

## Pass condition

Every task in the plan:
1. Has exactly **RED**, **ACTION**, **GREEN** — no tasks with fewer steps
2. RED step describes a binary state: something is either present or absent, exists
   or does not exist — not "is good" or "is complete"
3. RED step is checkable by the agent using a command or file read (grep, cat, ls, etc.)
4. GREEN step re-checks the exact same condition from RED and confirms it passes
