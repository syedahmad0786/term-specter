const enabled =
  process.env.NO_COLOR == null && Boolean(process.stdout && process.stdout.isTTY)

/**
 * @param {string} code
 * @param {string} text
 */
function wrap(code, text) {
  return enabled ? `\x1b[${code}m${text}\x1b[0m` : text
}

export const dim = (text) => wrap('2', text)
export const ghost = (text) => wrap('38;5;141', text)
export const whisper = (text) => wrap('38;5;245', text)

/** @param {string} text */
export function say(text) {
  return `${ghost('∴')}  ${text}`
}
