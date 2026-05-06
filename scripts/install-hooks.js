#!/usr/bin/env node
/**
 * Copies the hooks from scripts/git-hooks/ into .husky/ and marks them executable.
 * Run from the repo root that wants to adopt dev-standards.
 *
 * Usage: npx @dayone-ai/dev-standards install-hooks
 *        (or add "prepare": "node node_modules/@dayone-ai/dev-standards/scripts/install-hooks.js")
 */

const fs = require('fs')
const path = require('path')

const HOOKS = ['pre-commit', 'commit-msg', 'pre-push']
const SRC_DIR = path.join(__dirname, 'git-hooks')
const DEST_DIR = path.join(process.cwd(), '.husky')

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true })
  console.log(`Created ${DEST_DIR}`)
}

for (const hook of HOOKS) {
  const src = path.join(SRC_DIR, hook)
  const dest = path.join(DEST_DIR, hook)
  fs.copyFileSync(src, dest)
  fs.chmodSync(dest, 0o755)
  console.log(`Installed ${hook} -> ${dest}`)
}

console.log('\nHooks installed. Run `npx husky install` to activate them.')
