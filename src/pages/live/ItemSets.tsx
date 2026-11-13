import { IonItem, IonList } from '@ionic/react'
import { LIVE_COPY } from './copy'
import { CurrentSet } from './CurrentSet'
import { PairSets } from './PairSets'
import { SetRow, SetSliding } from './SetRow'
import { type SetRowsProps, slidingActions } from './slidingActions'
import './setRows.css'

function SingleSets(props: SetRowsProps) {
  const { item, selection, rest } = props
  const [workoutExercise] = item.exercises
  const total = workoutExercise.sets.length

  return (
    <IonList className="list-plates set-list">
      {workoutExercise.sets.map((set, index) => (
        <SetSliding key={index} {...slidingActions(props, { exercise: 0, set: index })}>
          {selection.current?.set === index ? (
            <IonItem className="set-row set-row-current">
              <CurrentSet
                title={LIVE_COPY.setPosition(index + 1, total)}
                label={LIVE_COPY.setOf(workoutExercise.name, index + 1)}
                target={workoutExercise.target}
                set={set}
                rest={rest}
                onChange={(patch) => selection.change(0, index, patch)}
              />
            </IonItem>
          ) : (
            <SetRow
              title={LIVE_COPY.setNumber(index + 1)}
              label={LIVE_COPY.setOf(workoutExercise.name, index + 1)}
              target={workoutExercise.target}
              set={set}
              onSelect={() => selection.select({ exercise: 0, set: index })}
              onChange={(patch) => selection.change(0, index, patch)}
            />
          )}
        </SetSliding>
      ))}
    </IonList>
  )
}

export function ItemSets(props: SetRowsProps) {
  return props.item.exercises.length > 1 ? <PairSets {...props} /> : <SingleSets {...props} />
}
