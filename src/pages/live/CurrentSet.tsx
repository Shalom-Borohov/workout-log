import type { ReactNode } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { LIVE_COPY } from './copy'
import { amountUnit, toDisplayAmount } from '../../domain/format'
import { MAX_WEIGHT, maxAmount } from '../../domain/limits'
import { amountPatch, weightPatch, weightText } from '../../domain/numberInput'
import type { SetLog, Target } from '../../domain/types'
import { WEIGHT_STEP, amountStep, stepValue } from '../../domain/workoutEdits'
import type { Rest } from '../../rest/restClock'
import { SetCheck } from '../../components/SetCheck'
import { RestPill } from './RestPill'
import { Stepper } from './Stepper'
import './plate.css'

interface CurrentSetProps {
  title: string
  heading?: ReactNode
  label: string
  target: Target
  set: SetLog
  rest: Rest | null
  onChange: (patch: Partial<SetLog>) => void
}

export function CurrentSet({ title, heading, label, target, set, rest, onChange }: CurrentSetProps) {
  const unit = amountUnit(target)
  const max = maxAmount(target)

  return (
    <section className="current-set plate-accent">
      {heading}
      <div className="current-top">
        <span className="current-title">{title}</span>
        {rest && <RestPill rest={rest} />}
      </div>
      <div className="current-fields">
        {target.kind === 'reps' && (
          <Stepper
            field={LIVE_COPY.weight}
            label={`${label} ${LIVE_COPY.weight}`}
            value={weightText(set.weight)}
            unit={LIVE_COPY.kg}
            inputMode="decimal"
            canDecrease={set.weight !== null && set.weight > 0}
            canIncrease={set.weight === null || set.weight < MAX_WEIGHT}
            onStep={(direction) => onChange({ weight: stepValue(set.weight, direction * WEIGHT_STEP, MAX_WEIGHT) })}
            onType={(text) => onChange(weightPatch(text))}
          />
        )}
        <Stepper
          field={target.kind === 'reps' ? COMMON_COPY.reps : LIVE_COPY.time}
          label={`${label} ${unit}`}
          value={String(toDisplayAmount(set.amount, target))}
          unit={unit}
          inputMode="numeric"
          canDecrease={set.amount > 0}
          canIncrease={set.amount < max}
          onStep={(direction) => onChange({ amount: stepValue(set.amount, direction * amountStep(target), max) })}
          onType={(text) => onChange(amountPatch(text, target))}
        />
      </div>
      <SetCheck label={label} done={set.done} size="large" onToggle={() => onChange({ done: !set.done })} />
    </section>
  )
}
