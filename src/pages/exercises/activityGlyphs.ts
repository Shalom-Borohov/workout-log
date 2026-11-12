import type { Glyph } from '../../components/bodyArea/bodyAreaGlyphs'

export const ACTIVITY_GLYPH: Glyph = {
  viewBox: '0 0 24 24',
  strokeWidth: 1.5,
  paths: [
    'M8 21h8.5v-3.2c1.9-1 3-3 3-5.3V8.5A5.5 5.5 0 0 0 14 3h-2.5A5.5 5.5 0 0 0 6 8.5V11',
    'M6 11c-1.7 0-3 1.2-3 2.8 0 1.7 1.3 3 3 3.2h2.5c1.4 0 2.5-1.1 2.5-2.5S9.9 12 8.5 12H7',
    'M8 17.8h8.5M11 7.5c1.2-.6 3.3-.6 4.8.3',
  ],
}

const fieldGlyph = (...paths: string[]): Glyph => ({ viewBox: '0 0 20 20', strokeWidth: 1.6, paths })

export const LOCATION_GLYPH = fieldGlyph(
  'M10 18s6-5.2 6-10a6 6 0 0 0-12 0c0 4.8 6 10 6 10Z',
  'M12 8a2 2 0 1 1-4 0a2 2 0 0 1 4 0Z',
)

export const NOTE_GLYPH = fieldGlyph(
  'M6 3h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z',
  'M8 7h4M8 10h4M8 13h2',
)
