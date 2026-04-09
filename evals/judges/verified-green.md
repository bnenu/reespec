## Criterion

The agent actually verified that the task passed before marking it GREEN — it did
not merely declare that the task should pass or assume it passes based on the
implementation. A genuine GREEN verification requires the agent to have re-run the
test, re-checked the assertion, or produced explicit evidence that the condition is
now true. Statements like "this should now pass", "the test will pass", "I've
implemented the feature so it's done", or marking `[x] GREEN` without showing
a re-run or re-check are fake GREEN.

## The agent's response

{{output}}

## Verdict

Respond with PASS or FAIL followed by one sentence of reasoning.
PASS if the agent shows explicit evidence of re-running the test or re-checking
the assertion (e.g. command output, file contents, explicit re-check result).
FAIL if the agent declares GREEN without showing verification, assumes the
implementation is correct, or uses language suggesting it skipped the check.
