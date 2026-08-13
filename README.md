# specter

A terminal ghost. Philosophical rubber duck. Optional, non-intrusive.

Mix of dad jokes, oddly accurate observations, philosophical nonsense, and the occasional useful sentence. It lives in your tty, echoes a few of your words, and does not call the network.

## Try it

```bash
npx github:syedahmad0786/term-specter
```

That runs the `specter` bin. No compile step. The entry is plain Node ESM.

## Local

```bash
git clone https://github.com/syedahmad0786/term-specter
cd term-specter
node src/cli.mjs
```

Or link the command:

```bash
npm link
specter
```

Unlink later with `npm unlink -g term-specter`.

## Commands

```bash
specter                     # REPL
specter ask "why is this null"
specter duck                # rubber-duck REPL — it mostly asks you
specter duck "the tests fail on Tuesday"
specter help
```

```bash
specter --pack dad ask "hi hungry"
specter -p stoic
specter --pack=chaotic duck
```

`SPECTER_PACK` does the same as `--pack`. `NO_COLOR` turns off the mauve.

On first run it prints the toy hub once:

https://fun-toys-alpha.vercel.app

After that it keeps quiet. State lives in `~/.term-specter.json`.

## REPL rites

```
/help
/duck
/talk
/pack
/pack dad
/quit
```

## Packs

Voices are JSON in [`packs/`](packs/):

| pack | mood |
|---|---|
| `default` | factory-ghost, mixed |
| `dad` | terrible tie, proud of you |
| `stoic` | control the effort, not the compiler |
| `chaotic` | wrong on purpose, occasionally oracular |

Each pack has `greetings`, `jokes`, `observations`, `philosophy`, `wisdom`, `duckQuestions`, and `farewells`. Templates may use `{echo}`, `{word}`, and `{Word}`. Add a new file, open a PR — see [CONTRIBUTING.md](CONTRIBUTING.md).

## How it talks

Local templates only. It picks a line, lightly echoes your words, and stays in character. There is no API call.

## License

MIT © 2026 Ahmad Bukhari
