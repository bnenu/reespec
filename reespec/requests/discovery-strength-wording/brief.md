## Context

During discovery sessions, models have occasionally misinterpreted "capturing thinking" as permission to produce "deliverables" — creating directory structures, templates, tools, or scripts. This short-circuits the discovery of intent and produces outputs that belong in plan or execute phases.

## Problem

The current discover mode guardrails use prohibitive language ("NEVER implement") which can be misinterpreted or carried over into subsequent phases. Additionally, the allowed file writes were not explicitly enumerated, leading to ambiguity about whether setting up "infrastructure" counts as capturing thinking.

## Goal

Clarify the discover mode skill to:
1. Use positive framing for allowed actions (brief.md, design.md, decisions.md, specs/)
2. Explicitly delegate "deliverable" creation to plan/execute phases
3. Explain *why* pre-building infrastructure short-circuits discovery
4. Ensure the wording is robust across non-coding use cases (documentation, research, process design)

## Impact

This is a framework-level change that affects the `reespec-discover` skill. It does not change the operational model, only the clarity of the guidance to prevent model misinterpretation.

## Non-goals

- Changing the artifacts produced by plan or execute
- Adding new phases or operational steps
- Changing the "one question at a time" rule
