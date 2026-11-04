import type { DrillColor } from '../domain/types'
import { drillColorStyle } from './drillColorStyle'
import './DrillDot.css'

export function DrillDot({ color }: { color: DrillColor | null }) {
  return <span className="drill-dot" style={color ? drillColorStyle(color) : undefined} aria-hidden="true" />
}
