import { IonIcon, IonItem } from '@ionic/react'
import { checkmark } from 'ionicons/icons'
import { LIVE_COPY } from './copy'
import { formatSet } from '../../domain/format'
import type { WorkoutItem } from '../../domain/types'
import type { Cell } from './useSetSelection'

interface PairRowProps {
  item: WorkoutItem
  set: number
  onSelect: (cell: Cell) => void
}

function rowCell(item: WorkoutItem, set: number): Cell {
  const logged = item.exercises.flatMap((workoutExercise, exercise) => (set < workoutExercise.sets.length ? [exercise] : []))
  const unticked = logged.find((exercise) => !item.exercises[exercise].sets[set].done)

  return { exercise: unticked ?? logged[0], set }
}

export function PairRow({ item, set, onSelect }: PairRowProps) {
  const allDone = item.exercises.every((workoutExercise) => set >= workoutExercise.sets.length || workoutExercise.sets[set].done)

  return (
    <IonItem className={allDone ? 'set-row pair-row set-done' : 'set-row pair-row'}>
      <button type="button" className="plain-button set-select" onClick={() => onSelect(rowCell(item, set))}>
        <span className="set-title">{LIVE_COPY.setNumber(set + 1)}</span>
        {item.exercises.map((workoutExercise, exercise) => (
          <span key={exercise} className="set-value">
            {set < workoutExercise.sets.length ? formatSet(workoutExercise.sets[set], workoutExercise.target) : LIVE_COPY.noValue}
          </span>
        ))}
        <span className="pair-mark">
          {allDone ? (
            <IonIcon icon={checkmark} role="img" aria-label={LIVE_COPY.completed} />
          ) : (
            <span className="pair-ring" aria-hidden="true" />
          )}
        </span>
      </button>
    </IonItem>
  )
}
