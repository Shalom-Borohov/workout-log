import { IonLabel, IonList, IonListHeader } from '@ionic/react'
import { Fragment } from 'react'
import { LIVE_COPY } from './copy'
import type { WorkoutItem } from '../../domain/types'
import { setCount } from '../../domain/workoutStructure'
import { SetRow } from './SetRow'
import type { Cell, SetSelection } from './useSetSelection'

interface SetRowsProps {
  item: WorkoutItem
  selection: SetSelection
}

function ExerciseSetRow({ item, selection, exercise, set }: SetRowsProps & Cell) {
  const workoutExercise = item.exercises[exercise]
  const { current } = selection

  return (
    <SetRow
      title={item.exercises.length > 1 ? workoutExercise.name : LIVE_COPY.setNumber(set + 1)}
      label={LIVE_COPY.setOf(workoutExercise.name, set + 1)}
      target={workoutExercise.target}
      set={workoutExercise.sets[set]}
      current={current !== undefined && current.exercise === exercise && current.set === set}
      onSelect={() => selection.select({ exercise, set })}
      canRemove={workoutExercise.sets.length > 1}
      onChange={(patch) => selection.change(exercise, set, patch)}
      onDuplicate={() => selection.duplicate(exercise, set)}
      onRemove={() => selection.remove(exercise, set)}
    />
  )
}

function SingleSets(props: SetRowsProps) {
  return (
    <IonList inset>
      {props.item.exercises[0].sets.map((_, set) => (
        <ExerciseSetRow key={set} {...props} exercise={0} set={set} />
      ))}
    </IonList>
  )
}

function PairSets(props: SetRowsProps) {
  return Array.from({ length: setCount(props.item) }, (_, set) => (
    <Fragment key={set}>
      <IonListHeader>
        <IonLabel>{LIVE_COPY.setNumber(set + 1)}</IonLabel>
      </IonListHeader>
      <IonList inset className="set-group">
        {props.item.exercises.map(
          (workoutExercise, exercise) =>
            set < workoutExercise.sets.length && (
              <ExerciseSetRow key={exercise} {...props} exercise={exercise} set={set} />
            ),
        )}
      </IonList>
    </Fragment>
  ))
}

export function ItemSets(props: SetRowsProps) {
  return props.item.exercises.length > 1 ? <PairSets {...props} /> : <SingleSets {...props} />
}
