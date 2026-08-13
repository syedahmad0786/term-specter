/**
 * @typedef {'repl' | 'ask' | 'duck' | 'watch' | 'help' | 'unknown'} Command
 * @typedef {object} CliArgs
 * @property {Command} command
 * @property {string} text
 * @property {string} pack
 * @property {boolean} help
 * @property {boolean} quiet
 * @property {string} [unknown]
 */

const COMMANDS = new Set(['ask', 'duck', 'help', 'watch'])

/**
 * Parse argv into a small command object.
 * @param {string[]} argv
 * @returns {CliArgs}
 */
export function parseArgv(argv) {
  /** @type {CliArgs} */
  const out = {
    command: 'repl',
    text: '',
    pack: process.env.SPECTER_PACK || 'default',
    help: false,
    quiet: false,
  }
  const positional = []
  const rest = argv.slice(2)

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i]
    if (token === '--help' || token === '-h') {
      out.help = true
    } else if (token === '--quiet' || token === '-q') {
      out.quiet = true
    } else if (token === '--pack' || token === '-p') {
      out.pack = rest[i + 1] || out.pack
      i += 1
    } else if (token.startsWith('--pack=')) {
      out.pack = token.slice('--pack='.length) || out.pack
    } else {
      positional.push(token)
    }
  }

  return applyCommand(out, positional)
}

/**
 * @param {CliArgs} out
 * @param {string[]} positional
 * @returns {CliArgs}
 */
function applyCommand(out, positional) {
  if (out.help) {
    out.command = 'help'
    return out
  }
  const [head, ...tail] = positional
  if (!head) return out
  if (COMMANDS.has(head)) {
    out.command = /** @type {Command} */ (head)
    out.text = tail.join(' ').trim()
    return out
  }
  out.command = 'unknown'
  out.unknown = head
  out.text = positional.join(' ').trim()
  return out
}
