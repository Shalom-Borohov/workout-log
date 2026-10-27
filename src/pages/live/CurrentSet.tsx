import { amountUnit, toDisplayAmount } from '../../domain/format'
import type { SetLog, Target } from '../../domain/types'
import { WEIGHT_STEP, amountStep, stepValue } from '../../domain/workoutEdits'
import { SetCheck } from './SetCheck'
import { Stepper } from './Stepper'
import { amountPatch, weightPatch, weightText } from './setFields'

interface CurrentSetProps {
  title: string
  label: string
  target: Target
  set: SetLog
  onChange: (patch: Partial<SetLog>) => void
}

export function CurrentSet({ title, label, target, set, onChange }: CurrentSetProps) {
  const unit = amountUnit(target)

  return (
    <div className="current-set">
      <span className="current-title">{title}</span>
      <div className="current-steppers">
        {target.kind === 'reps' && (
          <Stepper
            field="משקל"
            label={`${label} משקל`}
            value={weightText(set.weight)}
            unit="ק״ג"
            inputMode="decimal"
            canDecrease={set.weight !== null && set.weight > 0}
            onStep={(direction) => onChange({ weight: stepValue(set.weight, direction * WEIGHT_STEP) })}
            onType={(text) => onChange(weightPatch(text))}
          />
        )}
        <Stepper
          field={target.kind === 'reps' ? 'חזרות' : 'זמן'}
          label={`${label} ${unit}`}
          value={String(toDisplayAmount(set.amount, target))}
          unit={unit}
          inputMode="numeric"
          canDecrease={set.amount > 0}
          onStep={(direction) => onChange({ amount: stepValue(set.amount, direction * amountStep(target)) })}
          onType={(text) => onChange(amountPatch(text, target))}
        />
      </div>
      <SetCheck label={label} done={set.done} size="large" onToggle={() => onChange({ done: !set.done })} />
    </div>
  )
}
