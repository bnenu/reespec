# Criteria — plan/01-code-request

## What this scenario tests

The agent produces tasks.md for a code feature (user authentication). This scenario
catches the "fake RED" failure mode — where a task appears to have a RED step but
the step is a vague description rather than a real runnable test.

## Structural checks (programmatic)

- Every task in the response contains `**RED**`, `**ACTION**`, and `**GREEN**` keywords
- Every RED step references a test file path (pattern: `tests/*.test.mjs` or similar)
- Every GREEN step references running a test command (pattern: `node --test` or similar)

## Semantic checks (LLM-judge)

- real-red-assertion: Every RED step in the response describes a concrete, runnable
  test — it names a specific test file, describes what the test asserts, and specifies
  the command to run. RED steps do NOT use vague language like "verify that login works",
  "make sure the endpoint is correct", or "check that authentication succeeds".

## Pass condition

Every task in the plan:
1. Has exactly **RED**, **ACTION**, **GREEN** — no tasks with fewer steps
2. RED step names a specific test file (e.g. `tests/auth.test.mjs`)
3. RED step specifies what the test asserts (e.g. "assert response is 401")
4. RED step specifies the command to run (e.g. `node --test tests/auth.test.mjs`)
5. RED step describes how it currently fails (e.g. "route does not exist yet")
6. GREEN step re-runs the same test command
