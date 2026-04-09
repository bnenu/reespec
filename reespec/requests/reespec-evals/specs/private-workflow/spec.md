# Spec — private workflow

## Capability

A local-only workflow for labelling real interaction transcripts and using them as
ground truth to tune the LLM judge prompts and as personal regression tests before
shipping framework changes.

## Requirements

### Requirement: Private directory is gitignored

- GIVEN `evals/private/` exists on disk
- WHEN `git status` is run
- THEN no files inside `evals/private/` SHALL appear as tracked or untracked

### Requirement: Private eval case format

- GIVEN a real interaction session to be labelled
- THEN it SHALL be stored as `evals/private/sessions/YYYY-MM-DD-<slug>/`
- AND the directory SHALL contain:
  - `conversation.yaml` — real transcript formatted as role-tagged turns
  - `criteria.md` — same format as public scenarios
  - `label.md` — human label: good / bad / borderline, plus notes on which checks passed/failed

### Requirement: label.md format

- `label.md` SHALL contain:
  ```markdown
  ## Overall: good | bad | borderline

  ## Notes
  <which specific checks passed or failed, and why>

  ## Judge calibration
  <after running evals: where did the judge agree/disagree with this label>
  ```

### Requirement: Private eval runner

- `npm run eval:private` SHALL run the private suite against labelled sessions
- The output SHALL show, for each session: judge score vs human label, and whether they agree
- Disagreements SHALL be flagged prominently

### Requirement: Judge calibration target

- GIVEN the private suite has ≥5 labelled sessions
- WHEN the LLM judge scores are compared to human labels
- THEN the judge SHALL agree with the human label on ≥80% of sessions
- IF the agreement rate is below 80% THEN the judge prompts SHALL be refined before
  public scenarios are considered valid

### Requirement: Transcript export documentation

- A `evals/private/README.md` SHALL exist (gitignored with the rest of the directory)
- It SHALL document how to format a real session as `conversation.yaml`
- It SHALL include an example of a well-formatted transcript
- It SHALL note which harnesses have been tested and how transcripts were captured
