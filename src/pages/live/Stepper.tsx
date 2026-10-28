import { IonIcon, IonInput } from '@ionic/react'
import { add, remove } from 'ionicons/icons'
import { LIVE_COPY } from './copy'

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
    <div className="stepper">
      <button
        type="button"
        className="stepper-button"
        aria-label={LIVE_COPY.decrease(field)}
        disabled={!canDecrease}
        onClick={() => onStep(-1)}
      >
        <IonIcon icon={remove} />
      </button>
      <div className="stepper-value">
        <IonInput
          className="stepper-input"
          aria-label={label}
          type="text"
          inputmode={inputMode}
          placeholder="–"
          value={value}
          onIonChange={(event) => typeof event.detail.value === 'string' && onType(event.detail.value)}
        />
        <span className="stepper-unit">{unit}</span>
      </div>
      <button
        type="button"
        className="stepper-button"
        aria-label={LIVE_COPY.increase(field)}
        disabled={!canIncrease}
        onClick={() => onStep(1)}
      >
        <IonIcon icon={add} />
      </button>
    </div>
  )
}
