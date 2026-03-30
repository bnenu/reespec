# Spec — pi extension package

## Capability

`pi-evaluate` is a standalone npm package published from its own repo, following the
same structure as `pi-load-skill` and `pi-file-watcher`. It contains the pi extension
entry point and the evaluate skill. Reespec is the first consumer but the package has
no hard dependency on reespec.

## Requirements

### Requirement: Package structure

- The package SHALL follow the pi extension package pattern:
  ```
  pi-evaluate/
    extensions/
      evaluate.ts
    skills/
      evaluate/
        SKILL.md
    package.json
    README.md
    CHANGELOG.md
  ```
- `package.json` SHALL declare `"pi": { "extensions": ["./extensions"] }`
- `package.json` SHALL declare `peerDependencies` on `@mariozechner/pi-coding-agent`
- The package SHALL have no runtime dependency on reespec

#### Scenario: Package installs cleanly

- GIVEN a user runs `npm install pi-evaluate` in a non-reespec project
- WHEN the package is installed
- THEN the evaluate skill SHALL be available via pi
- AND it SHALL work in standalone mode (freeform contract)
- AND it SHALL NOT fail or error due to missing reespec artifacts

### Requirement: Skill entry point

- The `SKILL.md` SHALL encode the full evaluate skill behavior
- The skill SHALL handle both reespec mode and standalone mode (see contract-entry-modes spec)
- The skill name in `SKILL.md` frontmatter SHALL be `evaluate`
- The skill description SHALL mention both reespec and standalone use

### Requirement: Separate repo

- The package SHALL live in its own git repository (`pi-evaluate`)
- The package SHALL be published to npm independently of reespec
- The reespec repo SHALL NOT contain the `pi-evaluate` source code
- The reespec repo MAY reference `pi-evaluate` as an optional peer or in documentation

### Requirement: README

- The README SHALL document:
  - What the skill does (adversarial post-execute evaluation)
  - Reespec mode usage
  - Standalone mode usage with example contract input
  - Installation: `npm install pi-evaluate`
  - The GAN inspiration (brief, accessible explanation)

#### Scenario: Reespec user installs pi-evaluate

- GIVEN a reespec user runs `npm install pi-evaluate`
- WHEN they invoke `/skill:evaluate` after an execute phase
- THEN the skill SHALL detect reespec artifacts and evaluate automatically
- AND the README SHALL have shown them exactly how to do this

#### Scenario: Non-reespec user installs pi-evaluate

- GIVEN a user with no reespec setup runs `npm install pi-evaluate`
- WHEN they invoke `/skill:evaluate`
- THEN the skill SHALL prompt for a freeform contract
- AND the README SHALL have shown them exactly how to do this
