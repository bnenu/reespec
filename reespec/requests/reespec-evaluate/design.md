# Design — reespec-evaluate

## Context

The evaluator is inspired by the GAN discriminator pattern: a second agent that sees
only the contract and the output — never the implementation intent — and returns a
structured verdict. It is adversarial by design: it tries to find gaps, not confirm
success.

This design covers two deliverables:
1. The `pi-evaluate` npm package (new repo) — the pi extension + skill
2. The `reespec-evaluate` skill integration — how reespec uses it

## The Evaluator Mental Model

```
CONTRACT side                    OUTPUT side
─────────────────────────        ──────────────────────────
brief.md (goals, non-goals)      actual files on disk
specs/ (GIVEN/WHEN/THEN)         test results (if code)
                                 documents, artifacts

           ↓                              ↓
           └──────── EVALUATOR ───────────┘
                          │
                          ▼
              structured verdict per spec
              SATISFIED / PARTIAL / UNSATISFIED / UNCLEAR
              + focus guidance for the human
```

The evaluator does NOT read:
- `tasks.md` — implementation plan (the "how")
- `design.md` — architectural reasoning
- Agent conversation history

## Verdict Format

One verdict block per spec capability:

```
### user-auth-capability
verdict:  ⚠️  PARTIAL
reason:   brief says "support OAuth and password login" —
          found OAuth implementation, no password login found
focus:    src/auth/ — missing password handler

### error-handling-capability
verdict:  ✅  SATISFIED
reason:   all error paths covered in tests/errors.test.mjs, match spec scenarios

### rate-limiting-capability
verdict:  ❓  UNCLEAR
reason:   brief mentions rate limiting but no spec defines it —
          cannot verify absence or presence, flag for human review
```

Followed by a triage summary:

```
## Triage
✅ Safe to skip:   error-handling, logging, config-loading
⚠️  Worth a look:  user-auth (password login missing)
❓  Human call:    rate-limiting (underspecified in contract)
```

## Output Type Inference

The evaluator infers what kind of output to look for from the contract language itself:

| Contract language signals         | Evaluator looks for         |
|-----------------------------------|-----------------------------|
| "CLI tool", "function", "test"    | files, runnable tests        |
| "document", "report", "section"   | file existence, content      |
| "API", "endpoint", "schema"       | interface files, types       |
| mixed signals                     | both code and documents      |

No explicit type declaration required. The brief tells you what to look for.

## Two Contract Entry Modes

### Mode 1 — Reespec (automatic)

```
User invokes: /skill:reespec-evaluate
Agent detects reespec artifacts exist
Agent loads: brief.md + specs/ silently
Agent scans: actual outputs
Agent returns: verdict
```

Detection heuristic: check for `reespec/requests/` directory and active request.
If found → reespec mode. If not → standalone mode.

### Mode 2 — Standalone (user-supplied contract)

```
User invokes: /skill:evaluate
Agent asks:  "What's the contract? Paste your original ask,
              acceptance criteria, or whatever defines done."
User pastes: freeform text (paragraph, list, ticket, brief)
Agent scans: outputs in current working directory
Agent returns: verdict
```

The contract is whatever the user says it is. No structure required.

## Package Structure (pi-evaluate repo)

```
pi-evaluate/
  extensions/
    evaluate.ts          ← pi extension entry point
  skills/
    evaluate/
      SKILL.md           ← the skill prompt
  package.json           ← name: "pi-evaluate", pi.extensions: ["./extensions"]
  README.md
  CHANGELOG.md
```

Follows the same pattern as `pi-load-skill` and `pi-file-watcher`.

## Reespec Integration

Reespec gains an optional fifth phase. No new CLI commands. No artifact changes.
The skill is invoked directly by the user after execute completes.

```
discover → plan → execute → [evaluate] → archive
                              optional
                              human-triggered
                              no hard gate
```

The `reespec-evaluate` skill inside this repo is a thin wrapper that:
1. Detects the active reespec request
2. Loads brief + specs as the contract
3. Delegates to the same evaluator core as the standalone skill

## Key Design Decisions

### Blind to implementation intent
`tasks.md` and `design.md` are explicitly excluded. This prevents the evaluator from
being charitable ("the task said X so I'll assume X was intended"). The gap between
intent and output is exactly what the evaluator must surface.

### LLM-as-judge, not rule-based
Output type inference and verdict generation require natural language reasoning over
the contract. A rule-based checker cannot handle the variety of request types. The
same LLM-as-judge pattern from `reespec-evals` applies here — but the subject is
implementation vs contract, not framework behavior.

### Separate repo, separate npm package
Consistent with `pi-load-skill` and `pi-file-watcher`. Clean separation ensures
`pi-evaluate` evolves independently of reespec. Reespec is the first consumer, not
the only one.

### No hard gate
The evaluator is optional and advisory. Forcing it as a gate before archive would
contradict reespec's "no formal gates" principle established in the framework design.
The human always decides what to do with the verdict.

### Standalone mode accepts freeform contract
Requiring structured input in standalone mode would kill adoption. A paragraph, a
copied ticket, a bullet list — all are valid contracts. The evaluator reasons over
whatever is supplied.

## Risks

- **LLM hallucination in verdicts** — evaluator may claim a spec is satisfied when
  it isn't, or vice versa. Mitigation: verdict always includes a `reason` anchored in
  specific file paths or contract quotes, so the human can verify.
- **Underspecified contracts** — vague briefs produce UNCLEAR verdicts, not false
  confidence. The UNCLEAR verdict is a feature, not a failure.
- **Scope creep into re-execution** — evaluator must stay advisory. No automatic
  re-entry into execute, even if gaps are found.
