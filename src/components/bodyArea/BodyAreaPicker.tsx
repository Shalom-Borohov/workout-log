import { useId } from 'react'
import { BODY_AREA_COPY } from '../../copy/bodyAreas'
import { AREA_CHOICES, areaKey, type BodyArea } from '../../domain/bodyAreas'
import { BodyAreaIcon } from './BodyAreaIcon'
import './bodyArea.css'

export function BodyAreaPicker({ value, onChange }: { value: BodyArea | null; onChange: (area: BodyArea | null) => void }) {
  const name = `body-area-${useId()}`

  return (
    <fieldset className="body-area-picker">
      <legend>{BODY_AREA_COPY.label}</legend>
      <div className="body-area-options">
        {AREA_CHOICES.map((area) => (
          <label key={areaKey(area)} className="body-area-option">
            <input
              type="radio"
              name={name}
              value={areaKey(area)}
              checked={value === area}
              onChange={() => onChange(area)}
              onClick={() => value === area && onChange(area)}
            />
            <BodyAreaIcon area={area} />
            <span>{BODY_AREA_COPY.name(area)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
