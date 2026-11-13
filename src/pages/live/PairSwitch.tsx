import { IonIcon } from '@ionic/react'
import { checkmark } from 'ionicons/icons'
import { LIVE_COPY } from './copy'
import { formatSet } from '../../domain/format'
import type { WorkoutExercise, WorkoutItem } from '../../domain/types'
import type { Cell } from './useSetSelection'
import './switch.css'

interface SegmentProps {
  workoutExercise: WorkoutExercise
  set: number
  active: boolean
  onSelect: () => void
}

function Segment({ workoutExercise, set, active, onSelect }: SegmentProps) {
  const setLog = workoutExercise.sets[set]

  return (
    <button type="button" className="plain-button pair-segment" aria-pressed={active} onClick={onSelect}>
      <span className="pair-segment-name">{workoutExercise.name}</span>
      {!active && (
        <>
          {' '}
          <span className="pair-segment-value">{formatSet(setLog, workoutExercise.target)}</span>
          {setLog.done && <IonIcon className="pair-segment-done" icon={checkmark} role="img" aria-label={LIVE_COPY.completed} />}
        </>
      )}
    </button>
  )
}

interface PairSwitchProps {
  item: WorkoutItem
  current: Cell
  onSelect: (cell: Cell) => void
}

export function PairSwitch({ item, current, onSelect }: PairSwitchProps) {
  const { exercise, set } = current

  if (!item.exercises.every((workoutExercise) => set < workoutExercise.sets.length)) {
    return <p className="pair-name">{item.exercises[exercise].name}</p>
  }

  return (
    <div className="pair-switch">
      {item.exercises.map((workoutExercise, index) => (
        <Segment
          key={index}
          workoutExercise={workoutExercise}
          set={set}
          active={index === exercise}
          onSelect={() => onSelect({ exercise: index, set })}
        />
      ))}
    </div>
  )
}
