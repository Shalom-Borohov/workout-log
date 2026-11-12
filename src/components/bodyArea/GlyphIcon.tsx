import type { Glyph } from './bodyAreaGlyphs'

interface Props {
  glyph: Glyph
  className: string
  slot?: 'start' | 'end'
  area?: string
}

export function GlyphIcon({ glyph, className, slot, area }: Props) {
  return (
    <svg
      slot={slot}
      className={className}
      viewBox={glyph.viewBox}
      strokeWidth={glyph.strokeWidth}
      aria-hidden="true"
      focusable="false"
      data-area={area}
    >
      {glyph.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
