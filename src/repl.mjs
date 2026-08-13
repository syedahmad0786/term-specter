import readline from 'node:readline'
import { resolvePack, listPackNames, defaultPacksDir, createSpecter } from './engine.mjs'
import { dim, ghost, whisper, say } from './style.mjs'
import { REPL_HELP } from './help.mjs'

/**
 * @param {object} opts
 * @param {import('./engine.mjs').Pack} opts.pack
 * @param {string} opts.used
 * @param {'talk' | 'duck'} [opts.mode]
 * @param {NodeJS.ReadableStream} [opts.input]
 * @param {NodeJS.WritableStream} [opts.output]
 * @returns {Promise<void>}
 */
export function startRepl(opts) {
  const input = opts.input || process.stdin
  const output = opts.output || process.stdout
  const specter = createSpecter({ pack: opts.pack, mode: opts.mode || 'talk' })
  const packsDir = defaultPacksDir()
  let used = opts.used

  const rl = readline.createInterface({
    input,
    output,
    prompt: dim('you · '),
  })

  const write = (line) => output.write(`${line}\n`)
  const speak = (text) => write(say(text))

  write('')
  write(ghost('  specter') + dim(` · ${opts.pack.tagline || 'a ghost in this tty'}`))
  write(dim(`  voice: ${used}. /help to fuss. /quit to leave.`))
  if (specter.getMode() === 'duck') {
    write(whisper('  rubber-duck mode. I ask. you think.'))
  }
  write('')
  rl.prompt()

  rl.on('line', (line) => {
    const handled = handleSlash(line.trim(), {
      specter,
      packsDir,
      write,
      speak,
      rl,
      getUsed: () => used,
      setUsed: (id) => {
        used = id
      },
    })
    if (handled === 'close') {
      rl.close()
      return
    }
    if (!handled) {
      const text = line.trim()
      if (text) speak(specter.reply(text))
    }
    if (rl.closed) return
    rl.prompt()
  })

  rl.on('close', () => {
    write(say(specter.reply('bye')))
  })

  return new Promise((resolve) => rl.on('close', resolve))
}

/**
 * @param {string} line
 * @param {object} ctx
 * @returns {boolean | 'close'}
 */
function handleSlash(line, ctx) {
  if (!line.startsWith('/')) return false
  const [cmd, ...rest] = line.slice(1).split(/\s+/)
  const arg = rest.join(' ')
  if (cmd === 'quit' || cmd === 'exit' || cmd === 'q') return 'close'
  if (cmd === 'help' || cmd === 'h') {
    ctx.write(REPL_HELP)
    return true
  }
  if (cmd === 'duck') {
    ctx.specter.setMode('duck')
    ctx.write(whisper('  rubber-duck mode. I ask. you think.'))
    return true
  }
  if (cmd === 'talk') {
    ctx.specter.setMode('talk')
    ctx.write(whisper('  back to ordinary haunting.'))
    return true
  }
  if (cmd === 'pack') return switchPack(arg, ctx)
  ctx.write(whisper('  unknown rite. /help'))
  return true
}

/**
 * @param {string} arg
 * @param {object} ctx
 */
function switchPack(arg, ctx) {
  const names = listPackNames(ctx.packsDir)
  if (!arg) {
    ctx.write(dim(`  packs: ${names.join(', ')}  (current: ${ctx.getUsed()})`))
    return true
  }
  const resolved = resolvePack(arg, ctx.packsDir)
  ctx.specter.setPack(resolved.pack)
  ctx.setUsed(resolved.used)
  if (resolved.fallback) {
    ctx.write(whisper(`  no pack called "${resolved.wanted}". wearing default.`))
  } else {
    ctx.write(whisper(`  wearing ${resolved.used}. ${resolved.pack.tagline || ''}`))
  }
  return true
}
