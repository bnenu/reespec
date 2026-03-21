# Brief — reespec Framework

## Why

AI agents produce better results when humans express their intent completely and precisely. Today, most human-agent workflows jump straight to implementation — the problem space is under-explored, plans lack verifiable acceptance criteria, and the reasoning behind decisions evaporates between sessions.

reespec is a specification framework that structures human-agent collaboration into three phases — **discover**, **plan**, **execute** — with a shared decision log that accumulates architectural and strategic knowledge over time. It is built on the proven practices of openspec, TDD, and spec-driven development, adapted for both technical and non-technical operators.

## What Changes

- A new CLI tool (`reespec`) that scaffolds requests and provides helper scripts for agents
- Four skills encoding the three phases and the decision log
- A universal task format with RED/ACTION/GREEN assertions for all task types
- A `decisions.md` artifact shared across requests capturing key decisions over time
- Naming and artifact structure that replaces openspec's "change" model with reespec's "request" model

## Goals

- Help humans express their intentions more completely so agent output is better
- Provide traceability of intent vs implementation over time
- Be approachable by technical and non-technical operators alike
- Work for solo operators and teams

## Non-Goals

- Workflow gates, approvals, or ticket management
- Real-time collaboration or multi-agent orchestration
- Replacing the agent itself — reespec provides context and structure, not execution
- Enforcing any specific tech stack or programming language

## Impact

- New CLI: `reespec` (mirrors openspec CLI commands with reespec naming)
- Four new skills: `reespec-discover`, `reespec-plan`, `reespec-execute`, `reespec-archive`
- New artifact structure under `reespec/requests/<name>/`
- Shared `reespec/decisions.md` across all requests
- openspec remains usable alongside reespec — no breaking changes to existing workflows
