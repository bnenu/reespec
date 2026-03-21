# Brief — npm-publish

## Why

reespec needs to be installable with a single command (`npm install -g reespec`) so users don't need to clone the repo, manage PATH, or run `npm install` manually. Publishing to npm makes reespec a proper distributable tool — skills are bundled inside the package and copied out on `reespec init`.

## What Changes

- `package.json` finalised for publication: version, license, files whitelist, bin entry, keywords
- `skills/` directory bundled inside the npm package
- `bin/reespec.mjs` resolves skill sources from the installed package location
- GitHub Actions CI/CD: test on push, publish to npm on version tag
- `npm publish` executed, package verified live on npmjs.com

## Goals

- `npm install -g reespec` works from npmjs.com
- `reespec init` after global install copies skills correctly from bundled package location
- Package name `reespec` on npm (check availability first)
- CI runs on every push; publishes on `v*` tags

## Non-Goals

- Scoped package `@reespec/cli` unless `reespec` name is taken
- Docker image
- Homebrew formula
- Website or docs site

## Impact

- `package.json` updated with publish-ready fields
- `.github/workflows/publish.yml` added
- README updated with `npm install -g reespec` as primary install method
- npm registry: `reespec` package published
