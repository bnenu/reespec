## Approach

Update the `reespec-discover` skill (`SKILL.md`) to address model misinterpretation where "capturing thinking" is conflated with "producing deliverables" (templates, tools, directory structures).

### Changes to the "IMPORTANT" block

Replace the current top-level warning with two distinct components:

1. **Positive Framing**: Explicitly list the only allowed file writes (brief.md, design.md, decisions.md, specs/) and explain that other outputs "belong in plan or execute."
2. **The "Why"**: Add the rationale that creating deliverables during discovery "short-circuits the discovery of intent."
3. **The "Mental Note" Protocol**: Add a specific instruction for when the model feels the urge to build: stop, make a mental note, and ask the human if it should be captured in the brief for planning instead.

### Rationale

- **Positive vs. Negative**: "NEVER" creates a permanent mental block that can confuse the model in later phases. "Those belong in plan/execute" delegates the task to the correct stage.
- **Scribing Protocol**: Forcing the model to verbally summarize and ask "Should this go in the brief?" keeps the model in the "thinking partner" role rather than shifting it into "builder" mode prematurely.

### Risks

- **Over-correction**: The model might become too hesitant to write even the allowed artifacts. 
  - *Mitigation*: The wording explicitly grants permission for the four artifact types.
- **Verbosity**: Adding more text to the "IMPORTANT" block might dilute its impact.
  - *Mitigation*: Keep the new paragraph concise and focused on the "mental note" behavior.

## Tradeoffs Considered

- **Adding a "Scribing" section vs. updating the "IMPORTANT" block**: We chose to keep it near the top "IMPORTANT" block because that is the first thing the model reads and where the "mode" is established.
- **Prohibitive language vs. Explanatory language**: We moved from "NEVER" to "Do not... because..." to provide the model with the reasoning it needs to resist "helpful" but premature actions.
