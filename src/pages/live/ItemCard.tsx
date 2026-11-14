import { IonNote, IonText } from '@ionic/react'
import type { ReactNode } from 'react'
import { LIVE_COPY } from './copy'
import type { WorkoutItem } from '../../domain/types'
import { isSkipped, itemTitle } from '../../domain/workoutEdits'
import { ExerciseNotes, Tips } from './ItemNotes'
import { ItemSets } from './ItemSets'
import type { Travel } from './useLiveWorkout'
import type { SetSelection } from './useSetSelection'
import './motion.css'

interface ItemCardProps {
  travel: Travel
  item: WorkoutItem
  sectionName: string
  position: number
  total: number
  selection: SetSelection
  onNote: () => void
  children: ReactNode
}

export function ItemCard({ travel, item, sectionName, position, total, selection, onNote, children }: ItemCardProps) {
  return (
    <div className={travel ? `item-card item-enter-${travel}` : 'item-card'}>
      <div className="item-heading">
        <IonNote className="item-section">
          {[sectionName, LIVE_COPY.positionOf(position, total)].filter((part) => part !== '').join(' · ')}
        </IonNote>
        <IonText>
          <h1>{itemTitle(item)}</h1>
        </IonText>
        <Tips item={item} />
        {isSkipped(item) && <IonNote className="item-skipped">{LIVE_COPY.skippedExercise}</IonNote>}
      </div>
      <ItemSets item={item} selection={selection} />
      <ExerciseNotes item={item} onNote={onNote} />
      {children}
    </div>
  )
}
