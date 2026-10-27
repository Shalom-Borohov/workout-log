import { IonIcon, IonInput } from '@ionic/react'
import { add, remove } from 'ionicons/icons'

interface StepperProps {
  field: string
  label: string
  value: string
  unit: string
  inputMode: 'decimal' | 'numeric'
  canDecrease: boolean
  onStep: (direction: 1 | -1) => void
  onType: (text: string) => void
}

export function Stepper({ field, label, value, unit, inputMode, canDecrease, onStep, onType }: StepperProps) {
  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper-button"
        aria-label={`הקטנת ${field}`}
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
          onIonChange={(e) => typeof e.detail.value === 'string' && onType(e.detail.value)}
        />
        <span className="stepper-unit">{unit}</span>
      </div>
      <button type="button" className="stepper-button" aria-label={`הגדלת ${field}`} onClick={() => onStep(1)}>
        <IonIcon icon={add} />
      </button>
    </div>
  )
}
