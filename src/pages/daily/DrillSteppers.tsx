import { IonItem, IonLabel } from '@ionic/react'
import { Stepper } from '../../components/Stepper'
import { COMMON_COPY } from '../../copy/common'
import { maxAmount } from '../../domain/limits'
import { targetAmount, withTargetAmount } from '../../domain/progress'
import { MAX_SETS, MIN_SETS } from '../../domain/routineEdit'
import type { DailyExercise } from '../../domain/types'
import { DAILY_COPY } from './copy'

const AMOUNT_FIELD = {
  reps: { label: COMMON_COPY.reps, min: 1, step: 1, fewer: DAILY_COPY.fewerReps, more: DAILY_COPY.moreReps },
  duration: { label: COMMON_COPY.seconds, min: 5, step: 5, fewer: DAILY_COPY.fewerSeconds, more: DAILY_COPY.moreSeconds },
}

interface DrillSteppersProps {
  exercise: DailyExercise
  named: boolean
  onChange: (change: Partial<DailyExercise>) => void
}

export function DrillSteppers({ exercise, named, onChange }: DrillSteppersProps) {
  const { name, sets, target } = exercise
  const amount = targetAmount(target)
  const field = AMOUNT_FIELD[target.kind]

  return (
    <>
      {named && (
        <IonItem lines="none" className="daily-exercise-name">
          <IonLabel>{name}</IonLabel>
        </IonItem>
      )}
      <IonItem lines="none" className="daily-stepper">
        <IonLabel>{COMMON_COPY.sets}</IonLabel>
        <Stepper
          value={sets}
          min={MIN_SETS}
          max={MAX_SETS}
          decreaseLabel={DAILY_COPY.forDrill(COMMON_COPY.removeSet, name)}
          increaseLabel={DAILY_COPY.forDrill(COMMON_COPY.addSet, name)}
          onChange={(value) => onChange({ sets: value })}
        />
      </IonItem>
      <IonItem className="daily-stepper">
        <IonLabel>{field.label}</IonLabel>
        <Stepper
          value={amount}
          min={field.min}
          max={maxAmount(target)}
          step={field.step}
          decreaseLabel={DAILY_COPY.forDrill(field.fewer, name)}
          increaseLabel={DAILY_COPY.forDrill(field.more, name)}
          onChange={(value) => onChange({ target: withTargetAmount(target, value) })}
        />
      </IonItem>
    </>
  )
}
