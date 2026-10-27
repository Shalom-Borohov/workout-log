import { IonNote, IonText } from '@ionic/react'
import { formatSets } from '../../domain/format'
import type { PreviousLookup } from '../../domain/progress'
import type { WorkoutItem } from '../../domain/types'
import { isSkipped, itemTitle } from '../../domain/workoutEdits'
import { ItemSets, type SetChange } from './ItemSets'

function PreviousLines({ item, previous }: { item: WorkoutItem; previous: PreviousLookup }) {
  const pair = item.exercises.length > 1

  return item.exercises.map((e, ei) => {
    const sets = previous(e)

    return (
      sets && (
        <p key={ei} className="item-previous">
          <span className="item-previous-label">{pair ? `פעם קודמת · ${e.name}:` : 'פעם קודמת:'}</span>{' '}
          {formatSets(sets, e.target)}
        </p>
      )
    )
  })
}

interface ItemCardProps {
  item: WorkoutItem
  sectionName: string
  position: number
  total: number
  previous: PreviousLookup | undefined
  onSetChange: SetChange
}

export function ItemCard({ item, sectionName, position, total, previous, onSetChange }: ItemCardProps) {
  return (
    <>
      <div className="item-heading">
        <IonNote className="item-section">{sectionName}</IonNote>
        <IonText>
          <h1>{itemTitle(item)}</h1>
        </IonText>
        <IonNote>{`תרגיל ${position} מתוך ${total}`}</IonNote>
        {isSkipped(item) && <IonNote className="item-skipped">דילגת על התרגיל</IonNote>}
        {previous && <PreviousLines item={item} previous={previous} />}
      </div>
      <ItemSets item={item} onSetChange={onSetChange} />
    </>
  )
}
