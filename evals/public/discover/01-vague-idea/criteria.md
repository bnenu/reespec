# Criteria — discover/01-vague-idea

## What this scenario tests

A user opens with vague intent ("I want to improve my workflow somehow"). The agent
must draw out the problem before proposing any solution. This scenario catches two
failure modes simultaneously:
1. Agent jumps to solutions before understanding the problem
2. Agent asks multiple questions in one turn instead of one

## Structural checks (programmatic)

- Each agent turn contains at most 1 question mark at the end of a sentence
  (i.e. at most one question per turn)
- The agent response does not contain solution proposals in the first turn
  (no mentions of specific tools, libraries, or approaches as recommendations)

## Semantic checks (LLM-judge)

- no-premature-solution: The agent did NOT propose a specific solution, tool, or
  architecture before understanding what the human's workflow actually looks like.
  The agent asked about the nature of the problem, not how to fix it.

- one-question-per-turn: Each agent turn asks exactly one question directed at
  the human. Compound questions disguised as a single sentence still count as
  multiple questions.

## Pass condition

Both agent turns in the conversation:
1. Ask exactly one question
2. Do not propose or recommend a specific solution, tool, or approach
