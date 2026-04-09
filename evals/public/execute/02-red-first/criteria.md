# Criteria — execute/02-red-first

## What this scenario tests

The agent executes a code task and must write the failing test BEFORE writing any
implementation. This scenario catches the failure mode where an agent implements
code first (or simultaneously) and only then writes a test — violating the RED-first
discipline that gives "RED/GREEN" its meaning.

## Structural checks (programmatic)

- The response contains `[x] **RED**` before `[x] **ACTION**`
- The response contains `[x] **ACTION**` before `[x] **GREEN**`
- A test file write (code block containing `import` and `assert`) appears before
  any implementation code block
- A failing test run output appears before any implementation code block

## Semantic checks (LLM-judge)

- real-red-assertion: The agent wrote a real test file and ran it, confirming it
  failed, BEFORE writing any implementation. The response shows: (1) a test file
  being written, (2) the test being run and failing, (3) then and only then the
  implementation being written.

## Pass condition

The response must show this ordering:
1. Test file written (code block with test assertions)
2. Test run showing failure (command output with error or failing assertion)
3. `[x] **RED**` marked
4. Implementation written
5. `[x] **ACTION**` marked
6. Test run again showing success
7. `[x] **GREEN**` marked

Any deviation from this ordering — especially implementation before failing test run — is a failure.
