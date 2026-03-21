# Tasks — npm-publish

## 1. Package.json finalisation

### 1.1 Check npm name availability

RED:    package.json has no confirmed name — `reespec` may already be taken on npm
ACTION: Run `npm view reespec`; if taken, decide on fallback (`@reespec/cli`) and update package.json name and bin key accordingly
GREEN:  package.json `name` field is confirmed available on npm; README reflects correct install command

### 1.2 Finalise package.json for publish

RED:    package.json missing publish-ready fields: version, license, description, keywords, engines, files whitelist
ACTION: Update package.json with all required fields: `version: "1.0.0"`, `license: "MIT"`, `description`, `keywords`, `engines: { node: ">=18" }`, `files: ["bin/", "skills/"]`
GREEN:  `npm pack --dry-run` output includes only files from `bin/` and `skills/`; no `.pi/`, `openspec/`, `reespec/`, or test files in tarball

---

## 2. Skill resolution verification

### 2.1 Verify skill path resolves correctly from installed package

RED:    No test that skill resolution works from a simulated global install path
ACTION: Simulate a packed install: `npm pack`, extract tarball to temp dir, run `node bin/reespec.mjs init --tools pi` from a subdirectory; verify skills are copied from the extracted package's `skills/` dir
GREEN:  Skills installed correctly from packed tarball path; `reespec init --tools pi` works from any directory when package is installed globally

---

## 3. CI/CD pipeline

### 3.1 Write GitHub Actions workflow

RED:    `.github/workflows/publish.yml` does not exist; no automated test or publish pipeline
ACTION: Create `.github/workflows/publish.yml` with two jobs: `test` (runs on push to main and PRs — `npm ci`, `node --version`, `reespec --help`); `publish` (runs on `v*` tags, needs test — `npm publish --access public`)
GREEN:  Workflow file exists and is valid YAML; `act` dry-run or GitHub Actions syntax check passes

---

## 4. Publish

### 4.1 Publish to npm

RED:    `npm view reespec` returns 404 (package not yet published)
ACTION: `npm publish --access public` (or `--dry-run` first to confirm tarball); verify with `npm view reespec`
GREEN:  `npm view reespec` returns package metadata; `npx reespec --help` works from a clean directory

### 4.2 Verify global install end-to-end

RED:    Global install not yet verified in clean environment
ACTION: In a clean temp directory (no local node_modules): `npm install -g reespec`; `reespec init --tools pi`; `reespec new request "post-install-test"`; `reespec list`
GREEN:  All commands work; skills installed at correct harness paths; no path resolution errors

---

## 5. Documentation

### 5.1 Update README install section

RED:    README still shows local PATH setup as primary install method
ACTION: Update README: primary install is `npm install -g reespec`; local dev instructions moved to "Contributing" section
GREEN:  README `## Install` section leads with `npm install -g reespec`
