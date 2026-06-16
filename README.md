# dev-standards

Shared git-hygiene toolkit for DayOne AI repositories.

Enforces author identity, conventional-commit format, AI-attribution rejection, and secret scanning — deterministically, via hooks and CI, not by reviewer judgment.

## What's included

| Artifact | Purpose |
|---|---|
| `commitlint.config.js` | Commitlint config: conventional format, lower-case subject, max lengths, AI-attribution rejection |
| `scripts/git-hooks/pre-commit` | Asserts `git config user.name` and `user.email` match the canonical identity |
| `scripts/git-hooks/commit-msg` | Runs commitlint + belt-and-suspenders AI-attribution grep |
| `scripts/git-hooks/pre-push` | Runs gitleaks on the push range and aborts on findings |
| `gitleaks.toml` | Baseline gitleaks config with org-specific rules and allowlists |
| `.github/workflows/commit-policy.yml` | Reusable GH Actions workflow: commitlint, author identity, AI-attribution, gitleaks |

## Install

### Prerequisites

- Node.js ≥ 18
- [gitleaks](https://github.com/gitleaks/gitleaks#installing) on PATH (for the `pre-push` hook and CI)

### In a consuming repo

```bash
# 1. Add as a dev dependency
npm install --save-dev @dayone-ai/dev-standards

# 2. Install Husky (if not already)
npm install --save-dev husky
npx husky install

# 3. Copy the hooks
node node_modules/@dayone-ai/dev-standards/scripts/install-hooks.js

# 4. Copy the commitlint config (or extend it)
cp node_modules/@dayone-ai/dev-standards/commitlint.config.js .

# 5. Copy the gitleaks config
cp node_modules/@dayone-ai/dev-standards/gitleaks.toml .
```

Or add to `package.json` so hooks are installed on every `npm install`:

```json
{
  "scripts": {
    "prepare": "husky install && node node_modules/@dayone-ai/dev-standards/scripts/install-hooks.js"
  }
}
```

### Using the reusable GH Actions workflow

```yaml
# .github/workflows/pr-checks.yml
name: PR checks
on:
  pull_request:

jobs:
  commit-policy:
    uses: dayone-ai/dev-standards/.github/workflows/commit-policy.yml@v1.0.0
```

## What each hook does

### `pre-commit`

Reads `git config user.name` and `git config user.email` from the local repo config and aborts the commit if either doesn't match the canonical DayOne AI identity (`eduardoaugustoes` / `s.eduardoaugusto@gmail.com`).

**Fix:** `git config user.name "eduardoaugustoes" && git config user.email "s.eduardoaugusto@gmail.com"`

### `commit-msg`

1. Runs `commitlint` against the commit message file using `commitlint.config.js`.
2. Greps for `Co-Authored-By:` and AI-attribution patterns as a belt-and-suspenders check.

Aborts with a descriptive error on any violation.

### `pre-push`

Reads the push refspecs from stdin and runs `gitleaks detect --log-opts <range>` over every push range. Aborts if gitleaks reports any findings.

## Intentional bypass (emergency only)

Every hook can be bypassed with `--no-verify`:

```bash
git commit --no-verify -m "..."
git push --no-verify
```

**You almost never should.** Bypassing defeats the purpose of deterministic enforcement. If you genuinely need to bypass:

1. Document why in the PR description.
2. Get a second pair of eyes before merging.
3. Add the commit SHA to `gitleaks.toml`'s allowlist if it's a known-safe false-positive.

## Commitlint rules

| Rule | Severity | Setting |
|---|---|---|
| `type-enum` | error | conventional types |
| `subject-case` | error | lower-case |
| `subject-max-length` | error | 72 |
| `body-max-line-length` | error | 100 |
| `no-ai-attribution` | error | blocks Co-Authored-By + AI markers |

## Upgrade path

Pin consuming repos to a specific tag:

```bash
npm install --save-dev @dayone-ai/dev-standards@1.0.0
```

When a new version is released:
1. Review the changelog.
2. Update the tag in `package.json` and the `workflow_call` ref.
3. Re-run `node node_modules/@dayone-ai/dev-standards/scripts/install-hooks.js` to refresh hook files.
# CI dogfood verification
