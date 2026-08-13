import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseArgv } from '../src/args.mjs'

test('no args means REPL', () => {
  const args = parseArgv(['node', 'specter'])
  assert.equal(args.command, 'repl')
  assert.equal(args.pack, process.env.SPECTER_PACK || 'default')
})

test('ask captures the rest of the line', () => {
  const args = parseArgv(['node', 'specter', 'ask', 'why', 'is', 'null'])
  assert.equal(args.command, 'ask')
  assert.equal(args.text, 'why is null')
})

test('duck with and without a prompt', () => {
  assert.equal(parseArgv(['node', 'specter', 'duck']).command, 'duck')
  assert.equal(parseArgv(['node', 'specter', 'duck', 'the mutex']).text, 'the mutex')
})

test('help flags and command', () => {
  assert.equal(parseArgv(['node', 'specter', 'help']).command, 'help')
  assert.equal(parseArgv(['node', 'specter', '--help']).command, 'help')
  assert.equal(parseArgv(['node', 'specter', '-h']).command, 'help')
})

test('pack can be a flag or --pack=', () => {
  assert.equal(parseArgv(['node', 'specter', '--pack', 'dad', 'ask', 'hi']).pack, 'dad')
  assert.equal(parseArgv(['node', 'specter', 'ask', '-p', 'stoic', 'hi']).pack, 'stoic')
  assert.equal(parseArgv(['node', 'specter', '--pack=chaotic', 'duck']).pack, 'chaotic')
})

test('unknown command is flagged', () => {
  const args = parseArgv(['node', 'specter', 'banish'])
  assert.equal(args.command, 'unknown')
  assert.equal(args.unknown, 'banish')
})
