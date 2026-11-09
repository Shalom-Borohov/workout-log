import { drillColorStyle } from '../../components/drillColorStyle'
import { Swatches } from '../../components/Swatches'
import { COMMON_COPY } from '../../copy/common'
import { DRILL_COLORS } from '../../domain/drillColors'
import type { DrillColor } from '../../domain/types'
import './drillColorPicker.css'

export function DrillColorPicker({ value, onChange }: { value: DrillColor | null; onChange: (color: DrillColor) => void }) {
  return (
    <fieldset className="swatch-fieldset drill-color-picker">
      <legend>{COMMON_COPY.color}</legend>
      <Swatches options={DRILL_COLORS} columns={4} value={value} swatchStyle={drillColorStyle} onChange={onChange} />
    </fieldset>
  )
}
