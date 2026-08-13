import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { announceHub, HUB_URL, loadState } from '../src/state.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const cli = path.join(root, 'src', 'cli.mjs')

/**
 * @param {string[]} argv
 * @param {NodeJS.ProcessEnv} [env]
 */
function run(argv, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, ...argv], {
      cwd: root,
      env: { ...process.env, NO_COLOR: '1', ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => resolve({ code, stdout, stderr }))
  })
}

function tmpState() {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'specter-')), 'state.json')
}

test('help prints usage and skips the hub', async () => {
  const state = tmpState()
  const { code, stdout } = await run(['help'], { SPECTER_STATE_PATH: state })
  assert.equal(code, 0)
  assert.match(stdout, /specter ask/)
  assert.doesNotMatch(stdout, /fun-toys/)
})

test('ask replies in one shot', async () => {
  const { code, stdout } = await run(['ask', 'the mutex is haunted'], {
    SPECTER_STATE_PATH: tmpState(),
  })
  assert.equal(code, 0)
  assert.match(stdout, /∴/)
  assert.ok(stdout.trim().length > 10)
})

test('duck one-shot asks a question', async () => {
  const { code, stdout } = await run(['duck', 'the tests fail on Tuesday'], {
    SPECTER_STATE_PATH: tmpState(),
  })
  assert.equal(code, 0)
  assert.match(stdout, /\?/)
})

test('unknown command exits 1', async () => {
  const { code, stderr } = await run(['banish'], { SPECTER_STATE_PATH: tmpState() })
  assert.equal(code, 1)
  assert.match(stderr, /does not know/)
})

test('first run prints the hub URL only once', async () => {
  const file = tmpState()
  const first = await run(['ask', 'hello'], { SPECTER_STATE_PATH: file })
  assert.match(first.stdout, /fun-toys\.vercel\.app/)
  const second = await run(['ask', 'hello'], { SPECTER_STATE_PATH: file })
  assert.doesNotMatch(second.stdout, /fun-toys\.vercel\.app/)
})

test('announceHub writes state', () => {
  const file = tmpState()
  const lines = []
  const printed = announceHub({ file, out: { write: (s) => lines.push(s) } })
  assert.equal(printed, true)
  assert.match(lines.join(''), new RegExp(HUB_URL.replace(/[.]/g, '\\.')))
  assert.equal(loadState(file).hubAnnounced, true)
  assert.equal(announceHub({ file, out: { write: () => {} } }), false)
})

test('pack flag reaches the engine', async () => {
  const { code, stdout } = await run(['--pack', 'dad', 'ask', 'hi hungry'], {
    SPECTER_STATE_PATH: tmpState(),
  })
  assert.equal(code, 0)
  assert.match(stdout, /∴/)
})

test('ask exits even if stdin stays open', async () => {
  const child = spawn(process.execPath, [cli, '--quiet', 'ask', 'still haunted'], {
    cwd: root,
    env: { ...process.env, NO_COLOR: '1', SPECTER_STATE_PATH: tmpState() },
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
  })
  const code = await Promise.race([
    new Promise((resolve) => child.on('close', resolve)),
    new Promise((_, reject) => {
      setTimeout(() => {
        child.kill()
        reject(new Error('ask hung on open stdin'))
      }, 5000)
    }),
  ])
  assert.equal(code, 0)
})
