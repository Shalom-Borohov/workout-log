import { useId } from 'react'
import { drillColorStyle } from '../../components/drillColorStyle'
import { DRILL_COLORS } from '../../domain/drillColors'
import type { DrillColor } from '../../domain/types'
import { ROUTINES_COPY } from './copy'
import './drillColorPicker.css'

export function DrillColorPicker({ value, onChange }: { value: DrillColor | null; onChange: (color: DrillColor) => void }) {
  const name = `drill-color-${useId()}`

  return (
    <fieldset className="drill-color-picker">
      <legend>{ROUTINES_COPY.color}</legend>
      <div className="drill-color-options">
        {DRILL_COLORS.map((color) => (
          <label key={color} className="drill-color-option">
            <input
              type="radio"
              name={name}
              value={color}
              checked={value === color}
              aria-label={ROUTINES_COPY.colorNames[color]}
              onChange={() => onChange(color)}
            />
            <span style={drillColorStyle(color)} />
          </label>
        ))}
      </div>
    </fieldset>
  )
}
