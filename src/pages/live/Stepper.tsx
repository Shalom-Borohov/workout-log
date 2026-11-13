import { IonIcon, IonInput } from '@ionic/react'
import { add, remove } from 'ionicons/icons'
import { LIVE_COPY } from './copy'
import { numeralChars } from './numeral'

interface StepperProps {
  field: string
  label: string
  value: string
  unit: string
  inputMode: 'decimal' | 'numeric'
  canDecrease: boolean
  canIncrease: boolean
  onStep: (direction: 1 | -1) => void
  onType: (text: string) => void
}

export function Stepper({ field, label, value, unit, inputMode, canDecrease, canIncrease, onStep, onType }: StepperProps) {
  return (
    <div className="current-field">
      <div className="current-number">
        <IonInput
          className="current-numeral"
          data-chars={numeralChars(value)}
          aria-label={label}
          type="text"
          inputmode={inputMode}
          placeholder={LIVE_COPY.noValue}
          value={value}
          onIonChange={(event) => typeof event.detail.value === 'string' && onType(event.detail.value)}
        />
        <span className="current-unit">{unit}</span>
      </div>
      <div className="current-steps">
        <button
          type="button"
          className="step-button"
          aria-label={LIVE_COPY.decrease(field)}
          disabled={!canDecrease}
          onClick={() => onStep(-1)}
        >
          <IonIcon icon={remove} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="step-button"
          aria-label={LIVE_COPY.increase(field)}
          disabled={!canIncrease}
          onClick={() => onStep(1)}
        >
          <IonIcon icon={add} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
