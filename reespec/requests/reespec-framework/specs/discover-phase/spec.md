# Spec — discover phase

## Capability

The discover phase is a structured conversation between a human operator and an AI agent that builds shared understanding of a request before any planning begins.

## Requirements

### Requirement: Thinking partner stance

- The agent SHALL act as a warm, curious thinking partner — not a form to fill out
- The agent SHALL use ASCII diagrams, analogies, and codebase investigation to ground the conversation
- The agent SHALL follow interesting threads and pivot when new information emerges

### Requirement: One question at a time

- The agent SHALL ask only one question at a time
- The agent SHALL wait for the human's answer before proceeding to the next question
- The agent SHALL NOT present multiple questions in the same turn

#### Scenario: Multiple open threads exist

- GIVEN the agent has identified several areas to explore
- WHEN the agent asks the human a question
- THEN it SHALL ask only the most important question for that moment
- AND defer other questions to subsequent turns

### Requirement: Decision tree exhaustion

- The agent SHALL challenge the human to explore all sides of a decision
- The agent SHALL pressure-test assumptions and surface edge cases
- The agent SHALL resolve each branch of the decision tree before moving on

### Requirement: Saturation detection

- The agent SHALL detect when sufficient understanding has been reached
- WHEN the agent believes discovery is complete
- THEN it SHALL signal this to the human ("I think we have enough to plan — want to explore anything else?")
- AND the human SHALL always have final say on when discovery ends

### Requirement: No formal gate

- The agent SHALL NOT block progress on any formal completion check
- The goal is shared confidence, not a system-enforced gate

### Requirement: Context consultation

- At the start of discover, the agent SHALL check for existing `reespec/decisions.md`
- The agent SHALL check for existing request artifacts if a request is named
- The agent SHALL use this context to ground the conversation in established decisions

### Requirement: Insight capture

- WHEN a decision or design insight crystallizes during discovery
- THEN the agent SHALL offer to capture it in `brief.md` or `decisions.md`
- AND the human SHALL decide whether to capture it — the agent SHALL NOT auto-capture

### Requirement: No implementation

- The agent SHALL NOT write code or implement features during discover
- The agent MAY create or update reespec artifacts (brief.md) if the human asks
