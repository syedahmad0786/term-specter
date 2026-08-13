import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * @typedef {object} Pack
 * @property {string} [id]
 * @property {string} [name]
 * @property {string} [description]
 * @property {string} [tagline]
 * @property {string[]} greetings
 * @property {string[]} jokes
 * @property {string[]} observations
 * @property {string[]} philosophy
 * @property {string[]} wisdom
 * @property {string[]} duckQuestions
 * @property {string[]} farewells
 */

export const PACK_KEYS = [
  'greetings',
  'jokes',
  'observations',
  'philosophy',
  'wisdom',
  'duckQuestions',
  'farewells',
]

const STOP = new Set(
  `a an and are as at be but by can could do does for from had has have how i if in is it its just like me my no not of on or so that the this to was we what when where which who why with would you your im ive youre thats theres about into over out up`.split(
    ' ',
  ),
)

const GREET = /^(hi|hey|hello|yo|sup|howdy|ahoy)\b/i
const BYE = /^(bye|goodbye|quit|exit|later|farewell|cya|see ya)\b/i
const JOKE = /\bjoke\b|make me laugh|tell me something funny/i

/**
 * @param {string} [fromUrl]
 * @returns {string}
 */
export function defaultPacksDir(fromUrl = import.meta.url) {
  return path.join(path.dirname(fileURLToPath(fromUrl)), '..', 'packs')
}

/** @param {string} name */
export function sanitizePackId(name) {
  return String(name || 'default')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')
}

/**
 * @param {string} [packsDir]
 * @returns {string[]}
 */
export function listPackNames(packsDir = defaultPacksDir()) {
  return fs
    .readdirSync(packsDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.slice(0, -5))
    .sort()
}

/**
 * @param {unknown} pack
 * @param {string} id
 * @returns {Pack}
 */
export function assertPack(pack, id) {
  if (!pack || typeof pack !== 'object') {
    throw new Error(`pack "${id}" is not an object`)
  }
  const record = /** @type {Record<string, unknown>} */ (pack)
  for (const key of PACK_KEYS) {
    if (!Array.isArray(record[key]) || record[key].length === 0) {
      throw new Error(`pack "${id}" needs a non-empty "${key}" array`)
    }
  }
  return /** @type {Pack} */ (pack)
}

/**
 * @param {string} name
 * @param {string} [packsDir]
 * @returns {Pack}
 */
export function loadPack(name, packsDir = defaultPacksDir()) {
  const id = sanitizePackId(name) || 'default'
  const file = path.join(packsDir, `${id}.json`)
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
  const pack = assertPack(raw, id)
  pack.id = pack.id || id
  return pack
}

/**
 * @param {string} name
 * @param {string} [packsDir]
 * @returns {{ pack: Pack, used: string, fallback: boolean, wanted: string }}
 */
export function resolvePack(name, packsDir = defaultPacksDir()) {
  const wanted = sanitizePackId(name) || 'default'
  const names = listPackNames(packsDir)
  if (names.includes(wanted)) {
    return { pack: loadPack(wanted, packsDir), used: wanted, fallback: false, wanted }
  }
  return {
    pack: loadPack('default', packsDir),
    used: 'default',
    fallback: true,
    wanted,
  }
}

/**
 * @param {string} text
 * @returns {string[]}
 */
export function interestingWords(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP.has(word))
}

/**
 * @param {string} text
 * @returns {{ echo: string, word: string }}
 */
export function extractEcho(text) {
  const trimmed = String(text || '').trim().replace(/\s+/g, ' ')
  const words = interestingWords(trimmed)
  const word = words[0] || 'this'
  if (!trimmed) return { echo: 'that', word }
  if (trimmed.length <= 42) return { echo: trimmed, word }
  const parts = trimmed.split(' ')
  const echo = parts.slice(Math.max(0, parts.length - 5)).join(' ')
  return { echo, word }
}

/**
 * @param {string} template
 * @param {string} text
 */
export function fillTemplate(template, text) {
  const { echo, word } = extractEcho(text)
  const Word = word.charAt(0).toUpperCase() + word.slice(1)
  return template
    .replaceAll('{echo}', echo)
    .replaceAll('{word}', word)
    .replaceAll('{Word}', Word)
}

/**
 * @param {string} text
 * @param {'talk' | 'duck'} mode
 * @returns {'greetings' | 'farewells' | 'jokes' | 'duckQuestions' | null}
 */
export function classify(text, mode) {
  const line = String(text || '').trim()
  if (BYE.test(line)) return 'farewells'
  if (mode === 'duck') return null
  if (GREET.test(line)) return 'greetings'
  if (JOKE.test(line)) return 'jokes'
  return null
}

/**
 * @param {Array<[string, number]>} table
 * @param {() => number} rng
 */
export function weightedPick(table, rng) {
  let cursor = rng()
  for (const [name, weight] of table) {
    cursor -= weight
    if (cursor <= 0) return name
  }
  return table[0][0]
}

/**
 * @param {string} text
 * @param {'talk' | 'duck'} mode
 * @param {() => number} [rng]
 */
export function chooseCategory(text, mode, rng = Math.random) {
  const forced = classify(text, mode)
  if (forced) return forced
  if (mode === 'duck') return 'duckQuestions'
  return weightedPick(
    [
      ['observations', 0.28],
      ['philosophy', 0.24],
      ['wisdom', 0.22],
      ['jokes', 0.18],
      ['greetings', 0.08],
    ],
    rng,
  )
}

/**
 * @param {string[]} items
 * @param {() => number} rng
 * @param {string[]} [recent]
 */
export function pickLine(items, rng, recent = []) {
  const fresh = items.filter((line) => !recent.includes(line))
  const pool = fresh.length ? fresh : items
  return pool[Math.floor(rng() * pool.length) % pool.length]
}

/**
 * @param {string} category
 * @param {Pack} pack
 * @param {string} text
 */
function templatesFor(category, pack, text) {
  const lines = /** @type {string[]} */ (pack[category] || pack.observations)
  const hasEcho = Boolean(String(text || '').trim())
  if (hasEcho) return lines
  const plain = lines.filter((line) => !line.includes('{echo}') && !line.includes('{word}'))
  return plain.length ? plain : lines
}

/**
 * @param {object} opts
 * @param {Pack} opts.pack
 * @param {string} [opts.text]
 * @param {'talk' | 'duck'} [opts.mode]
 * @param {string} [opts.category]
 * @param {() => number} [opts.rng]
 * @param {string[]} [opts.recent]
 */
export function reply(opts) {
  const text = opts.text || ''
  const mode = opts.mode || 'talk'
  const rng = opts.rng || Math.random
  const category = opts.category || chooseCategory(text, mode, rng)
  const lines = templatesFor(category, opts.pack, text)
  const template = pickLine(lines, rng, opts.recent)
  if (opts.recent) {
    opts.recent.push(template)
    if (opts.recent.length > 8) opts.recent.shift()
  }
  return fillTemplate(template, text)
}

/**
 * @param {object} [opts]
 * @param {Pack} opts.pack
 * @param {'talk' | 'duck'} [opts.mode]
 * @param {() => number} [opts.rng]
 */
export function createSpecter(opts) {
  let pack = opts.pack
  let mode = opts.mode || 'talk'
  const rng = opts.rng || Math.random
  /** @type {string[]} */
  const recent = []
  return {
    /** @param {string} text */
    reply(text) {
      return reply({ pack, text, mode, rng, recent })
    },
    /** @param {'talk' | 'duck'} next */
    setMode(next) {
      mode = next
    },
    getMode() {
      return mode
    },
    /** @param {Pack} next */
    setPack(next) {
      pack = next
      recent.length = 0
    },
    getPack() {
      return pack
    },
  }
}
