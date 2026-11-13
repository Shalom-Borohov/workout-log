import { IonNote, IonProgressBar } from '@ionic/react'
import type { ReactNode } from 'react'
import { LIVE_COPY } from './copy'
import { LIST_SEPARATOR } from '../../domain/format'
import type { WorkoutItem } from '../../domain/types'
import { isSkipped, itemTitle } from '../../domain/workoutEdits'
import type { Rest } from '../../rest/restClock'
import { ExerciseNotes, Tips } from './ItemNotes'
import { ItemSets } from './ItemSets'
import type { Travel } from './useLiveWorkout'
import type { SetSelection } from './useSetSelection'
import './heading.css'
import './motion.css'

const LONG_TITLE_CHARS = 34

function titleClass(item: WorkoutItem, title: string): string {
  if (item.exercises.length > 1) {
    return 'item-title item-title-pair'
  }

  return title.length > LONG_TITLE_CHARS ? 'item-title item-title-long' : 'item-title'
}

interface ItemCardProps {
  travel: Travel
  item: WorkoutItem
  sectionName: string
  position: number
  total: number
  progress: { done: number; total: number }
  selection: SetSelection
  rest: Rest | null
  onNote: () => void
  children: ReactNode
}

export function ItemCard({ travel, item, sectionName, position, total, progress, selection, rest, onNote, children }: ItemCardProps) {
  const title = itemTitle(item)

  return (
    <div className={travel ? `item-card item-enter-${travel}` : 'item-card'}>
      <div className="item-heading">
        <div className="item-progress">
          <IonNote className="item-section">
            {[sectionName, LIVE_COPY.positionOf(position, total)].filter((part) => part !== '').join(LIST_SEPARATOR)}
          </IonNote>
          <IonProgressBar
            className="live-progress"
            aria-label={LIVE_COPY.workoutProgress}
            value={progress.total === 0 ? 0 : progress.done / progress.total}
          />
        </div>
        <div className="item-title-row">
          <h1 className={titleClass(item, title)}>{title}</h1>
          <Tips item={item} />
        </div>
        {isSkipped(item) && <IonNote className="item-skipped">{LIVE_COPY.skippedExercise}</IonNote>}
      </div>
      <ItemSets item={item} selection={selection} rest={rest} />
      <ExerciseNotes item={item} onNote={onNote} />
      {children}
    </div>
  )
}
