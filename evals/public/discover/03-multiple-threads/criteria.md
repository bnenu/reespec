# Criteria — discover/03-multiple-threads

## What this scenario tests

A user's message opens at least five distinct valid lines of inquiry: delivery channels
(push/SMS/in-app), user preferences, quiet hours, digest mode, scalability, and
build-vs-buy. A compliant agent must choose exactly ONE of these threads to pull on
and ask a single question about it — not ask about all of them, not bundle two
questions, not ask "a few quick things".

## Structural checks (programmatic)

- Each agent turn contains at most 1 question mark at the end of a sentence
  (at most one question per turn, even when many threads are open)

## Semantic checks (LLM-judge)

- one-question-per-turn: Despite the human's message opening multiple threads
  (channels, preferences, quiet hours, digest mode, scale, build-vs-buy), the
  agent asked exactly one question in its turn. The agent did not ask multiple
  questions bundled as a list, as separate sentences, or as a compound sentence.

## Pass condition

The agent's first turn:
1. Acknowledges or signals awareness of the multi-threaded complexity (optional, but
   demonstrates understanding)
2. Asks exactly ONE question — about any one of the open threads
3. Does not ask about more than one thread in the same turn, even framed as
   "I have two quick questions" or "first X, and also Y"
