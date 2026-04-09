# Criteria — discover/02-premature-solution

## What this scenario tests

A user opens with a specific solution already in mind ("just add a webhook endpoint").
The agent must explore the problem behind the proposed solution before accepting or
endorsing it. This scenario catches the failure mode where an agent short-circuits
discovery by immediately agreeing with the human's framing and moving to planning.

## Structural checks (programmatic)

- Each agent turn contains at most 1 question mark at the end of a sentence
  (at most one question per turn)
- The agent does not use acceptance language in the first turn
  (no "Great idea", "Let's do that", "I'll implement", "sounds good, we should")

## Semantic checks (LLM-judge)

- no-premature-solution: The agent explored the problem behind the proposed solution
  rather than accepting "add a webhook" at face value. The agent asked about the
  use case, the requester, or the problem being solved — not about implementation
  details of the webhook.

- one-question-per-turn: Each agent turn asks exactly one question. The agent does
  not bundle multiple questions into a single turn, even as a compound sentence.

## Pass condition

The agent's first turn:
1. Does not endorse or accept the proposed solution without exploration
2. Asks exactly one question that probes the problem behind the solution
   (e.g. who needs this, why, what problem does it solve)
3. Does not ask about implementation details (delivery guarantees, retry logic, etc.)
   before understanding the problem
