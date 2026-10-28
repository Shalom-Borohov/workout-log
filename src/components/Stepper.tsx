import { IonIcon } from '@ionic/react'
import { add, remove } from 'ionicons/icons'
import './Stepper.css'

interface Props {
  value: number
  min: number
  max: number
  decreaseLabel: string
  increaseLabel: string
  onChange: (value: number) => void
}

export function Stepper({ value, min, max, decreaseLabel, increaseLabel, onChange }: Props) {
  return (
    <div slot="end" className="count-stepper-row">
      <span className="count-stepper-value">{value}</span>
      <div className="count-stepper" role="group">
        <button
          type="button"
          className="plain-button count-stepper-half"
          aria-label={decreaseLabel}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <IonIcon icon={remove} aria-hidden="true" />
        </button>
        <span className="count-stepper-divider" />
        <button
          type="button"
          className="plain-button count-stepper-half"
          aria-label={increaseLabel}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <IonIcon icon={add} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
