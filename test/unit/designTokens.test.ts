import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SOURCE_DIR = 'src'
const TOKEN_FILE = join(SOURCE_DIR, 'theme.css')

const HEX_COLOUR = /#[0-9a-f]{3,8}\b/i
const NUMERIC_WEIGHT = /font-weight:\s*\d/
const SHORT_SCREEN_QUERY = /@media[^{]*max-height/

const REMOVED_NAMES = [
  '--app-fill',
  '--app-seam',
  '--app-label-dim',
  '--app-radius-tile',
  '--app-radius-panel',
  '--app-type-poster',
  '--app-weight-thin',
  '--app-weight-light',
  '--app-weight-regular',
  '.tile',
]

const cssFilesIn = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      return cssFilesIn(path)
    }

    return entry.name.endsWith('.css') ? [path] : []
  })

const stylesheets = cssFilesIn(SOURCE_DIR).map((path) => ({ path, css: readFileSync(path, 'utf8') }))

const featureStylesheets = stylesheets.filter(({ path }) => path !== TOKEN_FILE)

const filesMatching = (sheets: typeof stylesheets, test: (css: string) => boolean) =>
  sheets.filter(({ css }) => test(css)).map(({ path }) => path)

describe('design tokens', () => {
  it('keeps colours in the token file', () => {
    expect(filesMatching(featureStylesheets, (css) => HEX_COLOUR.test(css))).toEqual([])
  })

  it('sets font weights through the weight tokens', () => {
    expect(filesMatching(featureStylesheets, (css) => NUMERIC_WEIGHT.test(css))).toEqual([])
  })

  it('has no special case for short screens', () => {
    expect(filesMatching(stylesheets, (css) => SHORT_SCREEN_QUERY.test(css))).toEqual([])
  })

  it.each(REMOVED_NAMES)('no stylesheet uses the removed name %s', (name) => {
    const used = new RegExp(`${name.replace('.', '\\.')}\\b`)

    expect(filesMatching(stylesheets, (css) => used.test(css))).toEqual([])
  })
})
