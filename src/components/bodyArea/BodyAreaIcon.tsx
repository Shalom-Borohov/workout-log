import { areaKey, type BodyArea } from '../../domain/bodyAreas'
import { BODY_AREA_GLYPHS } from './bodyAreaGlyphs'
import './bodyArea.css'

export function BodyAreaIcon({ area, slot }: { area: BodyArea | null; slot?: 'start' | 'end' }) {
  const key = areaKey(area)
  const glyph = BODY_AREA_GLYPHS[key]

  return (
    <svg
      slot={slot}
      className="body-area-icon"
      viewBox={glyph.viewBox}
      strokeWidth={glyph.strokeWidth}
      aria-hidden="true"
      focusable="false"
      data-area={key}
    >
      {glyph.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
