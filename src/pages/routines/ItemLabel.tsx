import { IonLabel, IonText } from '@ionic/react'
import { Fragment } from 'react'
import { amountUnit, formatAmount } from '../../domain/format'
import { targetAmount } from '../../domain/progress'
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

export function ItemLabel({ item }: { item: RoutineItem }) {
  return (
    <IonLabel>
      <h2>{itemTitle(item)}</h2>
      <p>
        {item.exercises.map((e, i) => (
          <Fragment key={i}>
            {i > 0 && ' + '}
            <TargetText target={e.target} />
          </Fragment>
        ))}
      </p>
    </IonLabel>
  )
}
