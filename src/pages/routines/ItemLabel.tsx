import { IonLabel, IonText } from '@ionic/react'
import { Fragment } from 'react'
import { amountUnit, formatAmount, formatWeight, setsLabel } from '../../domain/format'
import { targetAmount } from '../../domain/progress'
import { itemSets } from '../../domain/routineEdit'
import type { RoutineItem, Target } from '../../domain/types'
import { itemTitle } from '../../domain/workoutEdits'

function TargetText({ target }: { target: Target }) {
  const amount = targetAmount(target)

  if (amount === 0) {
    return (
      <>
        <IonText color="danger">?</IonText> {amountUnit(target)}
      </>
    )
  }

  return target.kind === 'reps' ? `${amount} ${amountUnit(target)}` : formatAmount(amount, target)
}

export function ItemLabel({ item, sectionSets }: { item: RoutineItem; sectionSets: number }) {
  const ownSets = itemSets(item, sectionSets)

  return (
    <IonLabel>
      <h2>{itemTitle(item)}</h2>
      <p>
        {item.exercises.map((exercise, index) => (
          <Fragment key={index}>
            {index > 0 && ' + '}
            <TargetText target={exercise.target} />
            {exercise.weight !== null && ` · ${formatWeight(exercise.weight)}`}
          </Fragment>
        ))}
        {ownSets !== sectionSets && ` · ${setsLabel(ownSets)}`}
      </p>
    </IonLabel>
  )
}
