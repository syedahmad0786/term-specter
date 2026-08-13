export const HELP = `specter — a terminal ghost / philosophical rubber duck

Usage:
  specter                 haunt this shell (REPL)
  specter ask "..."       one shot, then gone
  specter duck [prompt]   rubber-duck mode — it asks you
  specter help            this page

Options:
  --pack, -p <name>       default | dad | stoic | chaotic
  --quiet, -q             skip the first-run hub line
  --help, -h              same as help

Env:
  SPECTER_PACK            same as --pack
  NO_COLOR                plain text

Packs live in /packs as JSON. PRs welcome — see CONTRIBUTING.md.
`

export const REPL_HELP = `  /help        this
  /duck        rubber-duck mode (it asks)
  /talk        normal haunting
  /pack        list voices
  /pack dad    switch voice
  /quit        unhaunt
`
