import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  PACK_KEYS,
  assertPack,
  chooseCategory,
  classify,
  createSpecter,
  defaultPacksDir,
  extractEcho,
  fillTemplate,
  listPackNames,
  loadPack,
  reply,
  resolvePack,
} from '../src/engine.mjs'

const zero = () => 0

test('packs on disk are complete', () => {
  const names = listPackNames()
  assert.deepEqual(names, ['chaotic', 'dad', 'default', 'stoic'])
  for (const name of names) {
    const pack = loadPack(name)
    assertPack(pack, name)
    for (const key of PACK_KEYS) {
      assert.ok(pack[key].length >= 8, `${name}.${key} is too thin`)
    }
  }
})

test('unknown pack falls back to default', () => {
  const resolved = resolvePack('not-a-voice')
  assert.equal(resolved.fallback, true)
  assert.equal(resolved.used, 'default')
  assert.equal(resolved.wanted, 'not-a-voice')
})

test('classify greetings, farewells, and jokes', () => {
  assert.equal(classify('hello there', 'talk'), 'greetings')
  assert.equal(classify('bye', 'talk'), 'farewells')
  assert.equal(classify('bye', 'duck'), 'farewells')
  assert.equal(classify('tell me a joke', 'talk'), 'jokes')
  assert.equal(classify('the mutex is sad', 'talk'), null)
})

test('duck mode prefers questions when rng is zero', () => {
  assert.equal(chooseCategory('the mutex is sad', 'duck', zero), 'duckQuestions')
})

test('echo pulls a short phrase and a word', () => {
  const { echo, word } = extractEcho('the mutex is haunted tonight')
  assert.equal(word, 'mutex')
  assert.match(echo, /mutex/)
})

test('templates echo user words', () => {
  const line = fillTemplate('you said {echo} about {word} / {Word}', 'the mutex is haunted')
  assert.match(line, /mutex/)
  assert.match(line, /Mutex/)
})

test('reply can be forced to a category', () => {
  const pack = loadPack('default')
  const line = reply({
    pack,
    text: 'the mutex is haunted',
    category: 'observations',
    rng: zero,
  })
  assert.equal(typeof line, 'string')
  assert.ok(line.length > 8)
})

test('duck specter asks a question', () => {
  const specter = createSpecter({ pack: loadPack('default'), mode: 'duck', rng: zero })
  const line = specter.reply('the tests fail on Tuesday')
  assert.match(line, /\?/)
})

test('defaultPacksDir points at /packs', () => {
  assert.match(defaultPacksDir(), /packs$/)
})
