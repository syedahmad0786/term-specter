import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const HUB_URL = 'https://fun-toys-alpha.vercel.app'

/** @returns {string} */
export function statePath() {
  return process.env.SPECTER_STATE_PATH || path.join(os.homedir(), '.term-specter.json')
}

/**
 * @param {string} [file]
 * @returns {{ hubAnnounced: boolean }}
 */
export function loadState(file = statePath()) {
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
    return { hubAnnounced: Boolean(raw && raw.hubAnnounced) }
  } catch {
    return { hubAnnounced: false }
  }
}

/**
 * @param {{ hubAnnounced: boolean }} state
 * @param {string} [file]
 */
export function saveState(state, file = statePath()) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

/**
 * Print the hub URL once, then remember.
 * @param {{ quiet?: boolean, out?: { write: (s: string) => void }, file?: string }} [opts]
 * @returns {boolean} whether the line was printed
 */
export function announceHub(opts = {}) {
  const out = opts.out || process.stdout
  const file = opts.file || statePath()
  if (opts.quiet) return false
  const state = loadState(file)
  if (state.hubAnnounced) return false
  out.write(`\n  specter noticed you.\n  other toys: ${HUB_URL}\n\n`)
  saveState({ hubAnnounced: true }, file)
  return true
}
