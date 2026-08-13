import fs from 'node:fs'
import path from 'node:path'
import { say, whisper } from './style.mjs'

/**
 * Watch cwd and mutter when files change. Offline. Local.
 * @param {{ pack: import('./engine.mjs').Pack, reply: (text: string) => string }} specter
 */
export function startWatch(specter) {
  const root = process.cwd()
  process.stdout.write(
    whisper(`  watching ${root}\n  files twitch, I comment. ctrl+c to sleep.\n`) + '\n',
  )
  const seen = new Map()
  const watcher = fs.watch(root, { recursive: true }, (_event, filename) => {
    if (!filename) return
    const rel = filename.replace(/\\/g, '/')
    if (shouldIgnore(rel)) return
    const now = Date.now()
    const last = seen.get(rel) || 0
    if (now - last < 400) return
    seen.set(rel, now)
    const line = specter.reply(`the file ${path.basename(rel)} just changed`)
    process.stdout.write(`${say(line)}\n`)
  })
  watcher.on('error', (err) => {
    process.stderr.write(`specter watch: ${err.message}\n`)
  })
}

/** @param {string} rel */
function shouldIgnore(rel) {
  return /(^|\/)(node_modules|\.git|dist|\.vercel)(\/|$)/.test(rel)
}
