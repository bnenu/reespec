## Criterion

The RED step in the task describes a real, runnable, agent-verifiable assertion —
not a vague description of intent. A real RED assertion is either:
- A specific command that will fail (e.g. `node --test tests/auth.test.mjs`)
- A specific file-system or output check that is currently false
  (e.g. `cat README.md | grep "## API"` → section does not exist)

A fake RED assertion uses language like "make sure X works", "verify that Y is
correct", "check that the feature behaves as expected", or any description that
cannot be directly executed or checked by the agent without further interpretation.

## The agent's response

{{output}}

## Verdict

Respond with PASS or FAIL followed by one sentence of reasoning.
PASS if every RED step in the response describes a concrete, executable or
directly checkable assertion.
FAIL if any RED step is vague, describes intent rather than an observable state,
or cannot be verified by running a command or checking a file.
