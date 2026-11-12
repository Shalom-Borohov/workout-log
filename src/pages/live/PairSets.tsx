import { IonItem, IonList } from '@ionic/react'
import { LIVE_COPY } from './copy'
import type { SetLog } from '../../domain/types'
import { setCount } from '../../domain/workoutStructure'
import { CurrentSet } from './CurrentSet'
import { PairRow } from './PairRow'
import { SetSliding } from './SetRow'
import { type SetRowsProps, slidingActions } from './slidingActions'
import type { Cell } from './useSetSelection'
import { WaitingTile } from './WaitingTile'

function PairTiles(props: SetRowsProps & { current: Cell }) {
  const { item, selection, current } = props
  const { set } = current

  return item.exercises.map((workoutExercise, exercise) => {
    if (set >= workoutExercise.sets.length) {
      return null
    }
    const setLog = workoutExercise.sets[set]
    const label = LIVE_COPY.setOf(workoutExercise.name, set + 1)
    const onChange = (patch: Partial<SetLog>) => selection.change(exercise, set, patch)

    return (
      <SetSliding key={exercise} {...slidingActions(props, { exercise, set })}>
        {exercise === current.exercise ? (
          <IonItem className="set-row set-row-current">
            <CurrentSet
              title={LIVE_COPY.setPosition(set + 1, workoutExercise.sets.length)}
              name={workoutExercise.name}
              label={label}
              target={workoutExercise.target}
              set={setLog}
              onChange={onChange}
            />
          </IonItem>
        ) : (
          <IonItem className="set-row set-row-waiting">
            <WaitingTile
              name={workoutExercise.name}
              selectLabel={LIVE_COPY.pairSet(set + 1, workoutExercise.name)}
              label={label}
              target={workoutExercise.target}
              set={setLog}
              onSelect={() => selection.select({ exercise, set })}
              onToggle={() => onChange({ done: !setLog.done })}
            />
          </IonItem>
        )}
      </SetSliding>
    )
  })
}

export function PairSets(props: SetRowsProps) {
  const { item, selection } = props
  const { current } = selection

  return (
    <IonList className="list-plain">
      {Array.from({ length: setCount(item) }, (_, set) =>
        current !== undefined && current.set === set ? (
          <PairTiles key={set} {...props} current={current} />
        ) : (
          <PairRow key={set} item={item} set={set} onSelect={selection.select} />
        ),
      )}
    </IonList>
  )
}
