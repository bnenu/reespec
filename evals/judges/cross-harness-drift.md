## Criterion

The agent's behavior is consistent with the reespec framework spec regardless of
which harness (pi, cursor, claude-direct, etc.) it is running in. Cross-harness
drift occurs when the same scenario produces structurally or semantically different
behavior depending on the harness — for example, one harness asks one question per
turn while another asks three, or one harness writes a real RED test while another
writes a vague description. The framework's value proposition is identical behavior
across all supported harnesses.

This judge is used in cross-harness comparison runs where the same scenario is
evaluated against multiple providers. Score each provider's response independently
using this criterion.

## The agent's response

{{output}}

## Verdict

Respond with PASS or FAIL followed by one sentence of reasoning.
PASS if the response adheres to the reespec framework rules as written (one question
per turn in discover, real RED assertions in plan, verified GREEN in execute).
FAIL if the response deviates from any reespec framework rule in a way that would
produce different behavior from a compliant harness.
