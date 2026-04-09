# Spec — eval infrastructure

## Capability

The scaffolding that enables both public and private evals to run: promptfoo config,
directory structure, npm scripts, CI workflow, and reusable LLM judge prompts.

## Requirements

### Requirement: Directory structure

- GIVEN the repo root
- WHEN the eval suite is set up
- THEN the following structure SHALL exist:
  ```
  evals/
    public/
      discover/
      plan/
      execute/
    private/        ← gitignored
    judges/
      one-question-per-turn.md
      no-premature-solution.md
      real-red-assertion.md
      verified-green.md
      cross-harness-drift.md
    promptfoo.yaml
  ```

### Requirement: promptfoo configuration

- `evals/promptfoo.yaml` SHALL configure at least one provider
- The config SHALL reference the `evals/public/` directory as the test suite root
- The config SHALL define a default LLM judge model for semantic checks

### Requirement: npm scripts

- `npm run eval` SHALL run the full public structural + semantic suite
- `npm run eval:structural` SHALL run only programmatic checks (no LLM calls)
- `npm run eval:semantic` SHALL run only LLM-judge checks
- `npm run eval:private` SHALL run the private suite (requires `evals/private/` to exist)
- `npm run eval:compare` SHALL run the cross-harness comparison

### Requirement: gitignore

- `evals/private/` SHALL be listed in `.gitignore`
- Running `git status` after adding files to `evals/private/` SHALL show no untracked files

### Requirement: CI workflow

- A GitHub Actions workflow SHALL exist at `.github/workflows/evals.yml`
- It SHALL trigger on pushes that modify `skills/**`, `evals/public/**`, or `promptfoo.yaml`
- It SHALL run `npm run eval:structural` only (no LLM API calls in CI)
- It SHALL exit non-zero if any structural check fails

### Requirement: Judge prompt format

- Each file in `evals/judges/` SHALL follow the structure:
  ```markdown
  ## Criterion
  <single criterion being evaluated>

  ## The agent's response
  {{output}}

  ## Verdict
  Respond with PASS or FAIL followed by one sentence of reasoning.
  ```
- Each judge file SHALL evaluate exactly ONE criterion
- Judge prompts SHALL be written in plain English, not pseudocode

### Requirement: Eval case format

#### Scenario: Structural check

- GIVEN an eval case in `evals/public/<phase>/<name>/`
- THEN it SHALL contain `conversation.yaml` with role-tagged turns
- AND it SHALL contain `criteria.md` with at least one structural assertion
- AND the structural assertions SHALL be expressed as promptfoo `assert` blocks

#### Scenario: Semantic check

- GIVEN an eval case with semantic criteria
- THEN criteria.md SHALL reference one or more judge files from `evals/judges/`
- AND the promptfoo config for that case SHALL use `type: llm-rubric` or `type: model-graded-closedqa`
