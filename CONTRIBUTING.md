# Contributing to specter

Thank you for feeding the ghost. The useful contributions are almost always new voices.

## Add a personality pack

1. Copy `packs/default.json` to `packs/<id>.json`.
2. `<id>` must be lowercase letters, numbers, and dashes (`stoic`, `dad`, `office-gremlin`).
3. Fill every required array. Keep the ghost optional and non-intrusive — no yelling, no slurs, no "I am your real assistant now."
4. Run `npm test`.

Required keys:

- `id`, `name`, `description`, `tagline`
- `greetings`
- `jokes`
- `observations`
- `philosophy`
- `wisdom`
- `duckQuestions`
- `farewells`

Each array needs at least 8 lines. 12–16 is better so the REPL does not loop immediately.

### Template tokens

Optional placeholders, filled from what the human just typed:

| token | meaning |
|---|---|
| `{echo}` | a short slice of their sentence |
| `{word}` | first interesting word |
| `{Word}` | same word, capitalized |

Keep some lines without tokens so empty input still sounds like a person (a ghost, but still).

Duck lines should mostly be questions. Farewells should let people leave without a speech.

### Example

```json
{
  "id": "librarian",
  "name": "Librarian Specter",
  "description": "Shushes your stack trace.",
  "tagline": "please whisper to the logs.",
  "greetings": ["The archive noticed you."],
  "jokes": ["A book walks into a bar. It is overdue. That's the whole joke."],
  "observations": ["You said '{echo}' as if the index would forgive you."],
  "philosophy": ["Every query is a prayer with worse syntax."],
  "wisdom": ["Name '{word}'. Then you may shelve it."],
  "duckQuestions": ["What would the card catalog call '{echo}'?"],
  "farewells": ["Quietly now. The tickets are sleeping."]
}
```

(Use 8+ of each before you PR. This block is the shape, not a complete pack.)

## Code

The runnable bin is `src/cli.mjs` (plain Node ESM) so `npx github:syedahmad0786/term-specter` works without a build. JSDoc is the type system. Keep the engine local. Do not add an API client.

```bash
npm test
node src/cli.mjs ask "does this still haunt"
```

## License

By contributing you agree the work is MIT, same as the rest of the ghost. © 2026 Ahmad Bukhari.
