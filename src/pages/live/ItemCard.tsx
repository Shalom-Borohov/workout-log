import { IonNote, IonText } from '@ionic/react'
import { Fragment } from 'react'
import { LIVE_COPY } from './copy'
import { formatSets } from '../../domain/format'
import type { PreviousSessionLookup } from '../../domain/progress'
import type { WorkoutItem } from '../../domain/types'
import { isSkipped, itemTitle } from '../../domain/workoutEdits'
import { ItemSets, type SetChange } from './ItemSets'
import type { Travel } from './useLiveWorkout'
import './motion.css'

function pairLabel(label: string, name: string, pair: boolean): string {
  return pair ? `${label} · ${name}:` : `${label}:`
}

function PreviousLines({ item, previous }: { item: WorkoutItem; previous: PreviousSessionLookup }) {
  const pair = item.exercises.length > 1

  return item.exercises.map((exercise, exerciseIndex) => {
    const session = previous(exercise)

    return (
      session && (
        <Fragment key={exerciseIndex}>
          <p className="item-previous">
            <span className="item-previous-label">{pairLabel(LIVE_COPY.previousTime, exercise.name, pair)}</span>{' '}
            {formatSets(session.sets, exercise.target)}
          </p>
          {session.note !== '' && (
            <p className="item-previous item-note">
              <span className="item-previous-label">{pairLabel(LIVE_COPY.note, exercise.name, pair)}</span> {session.note}
            </p>
          )}
        </Fragment>
      )
    )
  })
}

function Tips({ item }: { item: WorkoutItem }) {
  const pair = item.exercises.length > 1

  return item.exercises.map(
    (exercise, exerciseIndex) =>
      exercise.tip !== '' && (
        <p key={exerciseIndex} className="item-tip">
          {pair ? `${exercise.name}: ${exercise.tip}` : exercise.tip}
        </p>
      ),
  )
}

interface ItemCardProps {
  travel: Travel
  item: WorkoutItem
  sectionName: string
  position: number
  total: number
  previous: PreviousSessionLookup | undefined
  onSetChange: SetChange
}

export function ItemCard({ travel, item, sectionName, position, total, previous, onSetChange }: ItemCardProps) {
  return (
    <div className={travel ? `item-card item-enter-${travel}` : 'item-card'}>
      <div className="item-heading">
        <IonNote className="item-section">{sectionName}</IonNote>
        <IonText>
          <h1>{itemTitle(item)}</h1>
        </IonText>
        <Tips item={item} />
        <IonNote>{LIVE_COPY.exerciseOf(position, total)}</IonNote>
        {isSkipped(item) && <IonNote className="item-skipped">{LIVE_COPY.skippedExercise}</IonNote>}
        {previous && <PreviousLines item={item} previous={previous} />}
      </div>
      <ItemSets item={item} onSetChange={onSetChange} />
    </div>
  )
}
