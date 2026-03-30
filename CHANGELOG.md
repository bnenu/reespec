# Changelog

All notable changes to the reespec framework are documented here.

---

## 1.1.0 — 2026-03-30

### Added

- **`evaluations.md` artifact** — new append-only log per request, written by the
  evaluate skill after each verdict. Captures timestamped evaluation entries
  (verdict blocks + triage summary) for traceability of intent vs outcome across
  multiple execute/evaluate cycles.

- **`reespec-evaluate` skill** — adversarial
  post-execute evaluator inspired by the GAN discriminator pattern. Reads
  `brief.md` + `specs/` as the contract, scans actual outputs, returns structured
  verdicts per capability (SATISFIED / PARTIAL / UNSATISFIED / UNCLEAR) plus a
  triage summary. Optional fifth phase in the reespec lifecycle:
  `discover → plan → execute → evaluate → archive`.

- **Standalone mode** in `pi-evaluate` — works outside reespec projects by accepting
  a freeform contract pasted by the user.

### Added

- **`reespec update` CLI command** — re-syncs skills from the installed package
  into all harnesses already set up in the project. Existing users run
  `npm update reespec && reespec update` to get new skills without re-initialising.

### Changed

- **`reespec-execute` skill (v1.2)** — now checks for `evaluations.md` at the start
  of execution. If found, reads the latest entry and announces PARTIAL/UNSATISFIED
  gaps to the user before beginning tasks. Older entries are treated as history only.

---

## 1.0.0 — 2026-03-20

Initial release of the reespec framework.

- Three-phase human-agent collaboration: `discover`, `plan`, `execute`
- Universal RED/ACTION/GREEN task format for code and non-code tasks
- Four skills: `reespec-discover`, `reespec-plan`, `reespec-execute`, `reespec-archive`
- Shared `reespec/decisions.md` cross-request decision log
- CLI tool (`reespec`) for scaffolding requests and managing artifacts
- Eval suite (`reespec-evals`) using promptfoo — structural checks in CI,
  semantic LLM-as-judge checks on demand
