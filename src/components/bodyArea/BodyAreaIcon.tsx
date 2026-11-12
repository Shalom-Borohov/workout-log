import { areaKey, type BodyArea } from '../../domain/bodyAreas'
import { BODY_AREA_GLYPHS } from './bodyAreaGlyphs'
import { GlyphIcon } from './GlyphIcon'
import './bodyArea.css'

export function BodyAreaIcon({ area, slot }: { area: BodyArea | null; slot?: 'start' | 'end' }) {
  const key = areaKey(area)

  return <GlyphIcon glyph={BODY_AREA_GLYPHS[key]} className="body-area-icon" slot={slot} area={key} />
}
