import { IonIcon } from '@ionic/react'
import { add, remove } from 'ionicons/icons'
import './Stepper.css'

interface ButtonsProps {
  canDecrease: boolean
  canIncrease: boolean
  decreaseLabel: string
  increaseLabel: string
  onDecrease: () => void
  onIncrease: () => void
}

export function StepperButtons({ canDecrease, canIncrease, decreaseLabel, increaseLabel, onDecrease, onIncrease }: ButtonsProps) {
  return (
    <div className="count-stepper" role="group">
      <button
        type="button"
        className="plain-button count-stepper-half"
        aria-label={decreaseLabel}
        disabled={!canDecrease}
        onClick={onDecrease}
      >
        <IonIcon icon={remove} aria-hidden="true" />
      </button>
      <span className="count-stepper-divider" />
      <button
        type="button"
        className="plain-button count-stepper-half"
        aria-label={increaseLabel}
        disabled={!canIncrease}
        onClick={onIncrease}
      >
        <IonIcon icon={add} aria-hidden="true" />
      </button>
    </div>
  )
}

interface Props {
  value: number
  min: number
  max: number
  step?: number
  decreaseLabel: string
  increaseLabel: string
  onChange: (value: number) => void
}

export function Stepper({ value, min, max, step = 1, decreaseLabel, increaseLabel, onChange }: Props) {
  return (
    <div slot="end" className="count-stepper-row">
      <span className="count-stepper-value">{value}</span>
      <StepperButtons
        canDecrease={value > min}
        canIncrease={value < max}
        decreaseLabel={decreaseLabel}
        increaseLabel={increaseLabel}
        onDecrease={() => onChange(Math.max(min, value - step))}
        onIncrease={() => onChange(Math.min(max, value + step))}
      />
    </div>
  )
}
