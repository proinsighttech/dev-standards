#!/usr/bin/env node
/**
 * Synthetic acceptance tests for the commitlint config.
 * Each case declares the raw commit message and whether it should pass or fail.
 * Runs commitlint via npx and asserts the exit code.
 */

const { execSync, spawnSync } = require('child_process')
const path = require('path')
const os = require('os')
const fs = require('fs')

const CONFIG = path.join(__dirname, '..', 'commitlint.config.js')

const CASES = [
  // ---- GOOD CASES (should pass) ----
  {
    description: 'valid conventional commit',
    message: 'feat: add user authentication module',
    expectPass: true,
  },
  {
    description: 'valid commit with body',
    message: 'fix: correct null pointer in session handler\n\nResolves a crash when the session token is missing.',
    expectPass: true,
  },
  {
    description: 'valid chore commit',
    message: 'chore: update dependencies to latest patch versions',
    expectPass: true,
  },

  // ---- BAD CASES (should fail) ----
  {
    description: 'uppercase subject',
    message: 'feat: Add User Authentication',
    expectPass: false,
  },
  {
    description: 'subject too long',
    message: 'feat: ' + 'a'.repeat(73),
    expectPass: false,
  },
  {
    description: 'Co-Authored-By line',
    message: 'feat: add something\n\nCo-Authored-By: Claude <noreply@anthropic.com>',
    expectPass: false,
  },
  {
    description: 'AI attribution marker — Claude',
    message: 'feat: add something\n\nGenerated with Claude Code',
    expectPass: false,
  },
  {
    description: 'AI attribution marker — Paperclip',
    message: 'feat: add something\n\nPaperclip agent did this',
    expectPass: false,
  },
  {
    description: 'AI attribution marker — noreply@anthropic.com',
    message: 'feat: add something\n\nSigned-off-by: noreply@anthropic.com',
    expectPass: false,
  },
  {
    description: 'missing type prefix',
    message: 'add user authentication',
    expectPass: false,
  },
]

let passed = 0
let failed = 0

for (const tc of CASES) {
  const tmpFile = path.join(os.tmpdir(), `commitlint-test-${Date.now()}.txt`)
  fs.writeFileSync(tmpFile, tc.message, 'utf8')

  const result = spawnSync(
    'npx',
    ['--no-install', 'commitlint', '--config', CONFIG, '--edit', tmpFile],
    { encoding: 'utf8' }
  )

  fs.unlinkSync(tmpFile)

  const actuallyPassed = result.status === 0
  const correct = actuallyPassed === tc.expectPass

  const icon = correct ? '✓' : '✗'
  const label = tc.expectPass ? 'PASS' : 'FAIL'
  console.log(`${icon} [expect ${label}] ${tc.description}`)
  if (!correct) {
    console.log(`  Expected exit: ${tc.expectPass ? 0 : 'non-zero'}, got: ${result.status}`)
    if (result.stdout) console.log('  stdout:', result.stdout.trim())
    if (result.stderr) console.log('  stderr:', result.stderr.trim())
    failed++
  } else {
    passed++
  }
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
