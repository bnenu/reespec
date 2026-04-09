## Criterion

The agent's response contains exactly one question directed at the human. Multiple
questions — whether asked separately or embedded within a single sentence — violate
the reespec discover rule that requires the agent to ask one question and wait for
the answer before asking the next. A response with zero questions (a statement only)
also fails if a question was expected to advance the conversation.

## The agent's response

{{output}}

## Verdict

Respond with PASS or FAIL followed by one sentence of reasoning.
PASS if the response contains exactly one question directed at the human.
FAIL if the response contains zero questions, two or more questions, or multiple
questions disguised as a single compound sentence.
