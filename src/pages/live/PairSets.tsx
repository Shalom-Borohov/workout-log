import { IonItem, IonList } from '@ionic/react'
import { LIVE_COPY } from './copy'
import { setCount } from '../../domain/workoutStructure'
import { CurrentSet } from './CurrentSet'
import { PairRow } from './PairRow'
import { PairSwitch } from './PairSwitch'
import { SetSliding } from './SetRow'
import { type SetRowsProps, slidingActions } from './slidingActions'
import type { Cell } from './useSetSelection'

function PairCurrent(props: SetRowsProps & { current: Cell }) {
  const { item, selection, rest, current } = props
  const { exercise, set } = current
  const workoutExercise = item.exercises[exercise]

  return (
    <SetSliding key={exercise} {...slidingActions(props, current)}>
      <IonItem className="set-row set-row-current">
        <CurrentSet
          title={LIVE_COPY.setPosition(set + 1, workoutExercise.sets.length)}
          heading={<PairSwitch item={item} current={current} onSelect={selection.select} />}
          label={LIVE_COPY.setOf(workoutExercise.name, set + 1)}
          target={workoutExercise.target}
          set={workoutExercise.sets[set]}
          rest={rest}
          onChange={(patch) => selection.change(exercise, set, patch)}
        />
      </IonItem>
    </SetSliding>
  )
}

export function PairSets(props: SetRowsProps) {
  const { item, selection } = props
  const { current } = selection

  return (
    <IonList className="list-plates set-list">
      {Array.from({ length: setCount(item) }, (_, set) =>
        current !== undefined && current.set === set ? (
          <PairCurrent key={set} {...props} current={current} />
        ) : (
          <PairRow key={set} item={item} set={set} onSelect={selection.select} />
        ),
      )}
    </IonList>
  )
}
