#!/usr/bin/env node

import { parseArgv } from './args.mjs'
import { resolvePack, createSpecter, defaultPacksDir } from './engine.mjs'
import { announceHub } from './state.mjs'
import { startRepl } from './repl.mjs'
import { startWatch } from './watch.mjs'
import { HELP } from './help.mjs'
import { whisper, say } from './style.mjs'

const args = parseArgv(process.argv)

if (args.command === 'unknown') {
  process.stderr.write(`specter does not know "${args.unknown}". try help.\n`)
  process.exitCode = 1
  detachStdin()
} else {
  await main(args)
}

/**
 * @param {import('./args.mjs').CliArgs} args
 */
async function main(args) {
  if (args.command === 'help') {
    process.stdout.write(HELP)
    detachStdin()
    return
  }
  announceHub({ quiet: args.quiet })
  const resolved = warnPack(args.pack)
  if (args.command === 'repl') {
    await startRepl({ pack: resolved.pack, used: resolved.used, mode: 'talk' })
    return
  }
  if (args.command === 'duck' && !args.text) {
    await startRepl({ pack: resolved.pack, used: resolved.used, mode: 'duck' })
    return
  }
  if (args.command === 'watch') {
    const specter = createSpecter({ pack: resolved.pack, mode: 'talk' })
    startWatch({ pack: resolved.pack, reply: (text) => specter.reply(text) })
    return
  }
  await oneShot(args, resolved)
  detachStdin()
}

/** @param {string} name */
function warnPack(name) {
  const resolved = resolvePack(name, defaultPacksDir())
  if (resolved.fallback) {
    process.stdout.write(
      whisper(`  no pack called "${resolved.wanted}". wearing default.`) + '\n',
    )
  }
  return resolved
}

/**
 * @param {import('./args.mjs').CliArgs} args
 * @param {{ pack: import('./engine.mjs').Pack }} resolved
 */
async function oneShot(args, resolved) {
  const text = args.text || (await readStdinIfPiped())
  const mode = args.command === 'duck' ? 'duck' : 'talk'
  const specter = createSpecter({ pack: resolved.pack, mode })
  const empty =
    mode === 'duck'
      ? 'The duck is listening. The duck is also judgmental. What is the actual problem?'
      : 'You opened your mouth and the wind came out. Try words.'
  const line = text ? specter.reply(text) : empty
  process.stdout.write(`\n${say(line)}\n\n`)
}

/** Let one-shot commands exit even if stdin is an open pipe. */
function detachStdin() {
  if (process.stdin.isTTY) return
  process.stdin.pause()
  if (typeof process.stdin.unref === 'function') process.stdin.unref()
}

/** @returns {Promise<string>} */
async function readStdinIfPiped() {
  if (process.stdin.isTTY) return ''
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8').trim()
}
