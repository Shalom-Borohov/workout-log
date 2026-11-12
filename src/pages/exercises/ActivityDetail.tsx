import { IonList } from '@ionic/react'
import { useActivityDetails, useFinishedRecords } from '../../data/hooks'
import { activitySessions, rememberedLocation } from '../../domain/activities'
import { ActivityFields } from './ActivityFields'
import { ActivitySessionRow } from './ActivitySessionRow'
import { HistoryLayout } from './HistoryLayout'
import './activity.css'

export function ActivityDetail({ name }: { name: string }) {
  const records = useFinishedRecords()
  const details = useActivityDetails()
  const sessions = records ? activitySessions(records, name) : []
  const saved = details?.get(name)

  return (
    <HistoryLayout name={name}>
      {records && details && (
        <ActivityFields
          name={name}
          location={rememberedLocation(records, details, name)}
          note={saved ? saved.note : ''}
        />
      )}
      {sessions.length > 0 && (
        <IonList inset className="activity-sessions">
          {sessions.map((session) => (
            <ActivitySessionRow key={session.id} session={session} />
          ))}
        </IonList>
      )}
    </HistoryLayout>
  )
}
