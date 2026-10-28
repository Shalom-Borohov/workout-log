import { IonLabel, IonList, IonListHeader } from '@ionic/react'
import { Fragment, useState } from 'react'
import { LIVE_COPY } from './copy'
import type { SetLog, WorkoutItem } from '../../domain/types'
import { setCount } from '../../domain/workoutStructure'
import { SetRow } from './SetRow'

export type SetChange = (exercise: number, set: number, patch: Partial<SetLog>) => void

type Cell = { exercise: number; set: number }

function cells(item: WorkoutItem): Cell[] {
  return Array.from({ length: setCount(item) }, (_, set) =>
    item.exercises.flatMap((workoutExercise, exercise) =>
      set < workoutExercise.sets.length ? [{ exercise, set }] : [],
    ),
  ).flat()
}

function firstUndone(item: WorkoutItem): Cell | undefined {
  return cells(item).find((cell) => !item.exercises[cell.exercise].sets[cell.set].done)
}

interface SetRowsProps {
  item: WorkoutItem
  current: Cell | undefined
  onSelect: (cell: Cell) => void
  onSetChange: SetChange
}

function ExerciseSetRow({ item, current, onSelect, onSetChange, exercise, set }: SetRowsProps & Cell) {
  const workoutExercise = item.exercises[exercise]

  return (
    <SetRow
      title={item.exercises.length > 1 ? workoutExercise.name : LIVE_COPY.setNumber(set + 1)}
      label={LIVE_COPY.setOf(workoutExercise.name, set + 1)}
      target={workoutExercise.target}
      set={workoutExercise.sets[set]}
      current={current !== undefined && current.exercise === exercise && current.set === set}
      onSelect={() => onSelect({ exercise, set })}
      onChange={(patch) => onSetChange(exercise, set, patch)}
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

export function ItemSets({ item, onSetChange }: { item: WorkoutItem; onSetChange: SetChange }) {
  const [selected, setSelected] = useState<Cell>()

  const props: SetRowsProps = {
    item,
    current: selected ?? firstUndone(item),
    onSelect: setSelected,
    onSetChange: (exercise, set, patch) => {
      if (patch.done === true) {
        setSelected(undefined)
      }
      onSetChange(exercise, set, patch)
    },
  }

  return item.exercises.length > 1 ? <PairSets {...props} /> : <SingleSets {...props} />
}
