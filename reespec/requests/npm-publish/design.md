# Design — npm-publish

## Context

After the `improve-init-ux` request is complete, the repo has a working Node.js CLI with `package.json` in place. This request finalises that package.json for publication and adds the CI/CD pipeline.

## Package structure

```
bin/
  reespec.mjs          ← CLI entry point
  reespec.sh           ← kept for reference, not published
  prompts/
    searchable-multi-select.mjs
skills/
  reespec-discover/SKILL.md
  reespec-plan/SKILL.md
  reespec-execute/SKILL.md
  reespec-archive/SKILL.md
package.json
README.md
```

## package.json fields

```json
{
  "name": "reespec",
  "version": "1.0.0",
  "type": "module",
  "description": "Human-agent collaboration framework — discover, plan, execute",
  "bin": { "reespec": "bin/reespec.mjs" },
  "files": ["bin/", "skills/"],
  "engines": { "node": ">=18" },
  "keywords": ["ai", "agent", "spec", "tdd", "collaboration"],
  "license": "MIT",
  "dependencies": {
    "@inquirer/core": "...",
    "chalk": "..."
  }
}
```

`files` whitelist includes `bin/` and `skills/` only — excludes `.pi/`, `openspec/`, `reespec/`, test files, and this repo's own agent config.

## Skill resolution in published package

When installed globally, `import.meta.url` points inside the npm global prefix. Skills resolve correctly because they are bundled under `bin/../skills/` which maps to `skills/` inside the package:

```js
const SKILLS_SRC = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../skills'
)
```

This is the same relative path used during local development — no special handling needed for installed vs local.

## CI/CD — GitHub Actions

Two jobs:

```
test:
  trigger: push to main, any PR
  steps: checkout, node 22, npm ci, npm test

publish:
  trigger: push of v* tag
  needs: test
  steps: checkout, node 22, npm ci, npm publish --access public
```

No Docker, no provenance flags needed for v1.

## Decisions

### files whitelist over .npmignore
Explicit whitelist is safer — only `bin/` and `skills/` ship. Everything else (agent config, openspec artifacts, test directories) is excluded by default.

### Publish on v* tag, not on every main push
Standard semver discipline. `npm version patch/minor/major` bumps version and creates tag.

### Check npm name availability before finalising
`npm view reespec` — if taken, fallback is `@reespec/cli`. README and bin entry update accordingly.

## Risks

- **npm name taken**: `reespec` may be registered. Mitigation: check first, fallback scoped name ready.
- **Global install path**: `npm install -g` puts bin in a PATH location that varies by OS/nvm setup. Standard npm behaviour, no special handling needed.
