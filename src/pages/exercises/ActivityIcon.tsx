import { GlyphIcon } from '../../components/bodyArea/GlyphIcon'
import { ACTIVITY_GLYPH } from './activityGlyphs'
import '../../components/bodyArea/bodyArea.css'

export function ActivityIcon({ slot }: { slot?: 'start' }) {
  return <GlyphIcon glyph={ACTIVITY_GLYPH} className="body-area-icon" slot={slot} />
}
