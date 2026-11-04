import { IonItem, IonLabel } from '@ionic/react'
import { FORMAT_COPY } from '../../copy/format'
import { recordName } from '../../domain/activities'
import { formatTime, LIST_SEPARATOR } from '../../domain/format'
import { summarize } from '../../domain/timeline'
import type { WorkoutRecord } from '../../domain/types'

export function DayRecordRow({ record, onOpen }: { record: WorkoutRecord; onOpen: () => void }) {
  return (
    <IonItem button detail onClick={onOpen}>
      <IonLabel>
        <h2>{recordName(record)}</h2>
        <p>{[formatTime(record.startedAt), FORMAT_COPY.minutes(summarize(record).minutes)].join(LIST_SEPARATOR)}</p>
      </IonLabel>
    </IonItem>
  )
}
