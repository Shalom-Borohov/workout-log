import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonModal, IonTitle, IonToolbar } from '@ionic/react'
import { useMemo, useState } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { TIMELINE_COPY } from './copy'
import { saveActivity } from '../../data/activityDetails'
import { useActivityDetails, useFinishedRecords } from '../../data/hooks'
import { activityNames, rememberedLocation } from '../../domain/activities'
import { pastTimeProblems } from '../../domain/pastTime'
import { MINUTE_MS } from '../../domain/time'
import type { Activity } from '../../domain/types'
import { useNow } from '../../hooks/useNow'
import { useSave } from '../../hooks/useSave'
import { ActivityNameSuggestions } from './ActivityNameSuggestions'
import { PastTimeItems, PastTimeNotes } from './PastTimeFields'
import { defaultPastTime, pastTimeOf, readPastTime } from './pastTimeForm'

interface FormProps {
  activity: Activity | null
  onClose: () => void
}

function ActivityForm({ activity, onClose }: FormProps) {
  const now = useNow(MINUTE_MS)
  const { save } = useSave()
  const [newId] = useState(() => crypto.randomUUID())
  const [name, setName] = useState(activity ? activity.name : '')
  const [typedLocation, setTypedLocation] = useState<string | null>(activity ? activity.location : null)
  const [pastTime, setPastTime] = useState(() => (activity ? pastTimeOf(activity) : defaultPastTime(now)))
  const records = useFinishedRecords()
  const details = useActivityDetails()
  const names = useMemo(() => (records ? activityNames(records) : []), [records])

  const { startedAt, minutes } = readPastTime(pastTime)
  const problems = pastTimeProblems(startedAt, minutes, now)
  const trimmedName = name.trim()
  const location = typedLocation ?? (records && details ? rememberedLocation(records, details, trimmedName) : '')
  const valid = trimmedName !== '' && problems.valid

  async function submit() {
    const base: Pick<Activity, 'kind' | 'id' | 'summary'> = activity ?? { kind: 'activity', id: newId, summary: '' }
    const record = { ...base, name: trimmedName, location: location.trim(), startedAt, finishedAt: startedAt + minutes * MINUTE_MS }

    if (await save(() => saveActivity(record, activity))) {
      onClose()
    }
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onClose}>{COMMON_COPY.cancel}</IonButton>
          </IonButtons>
          <IonTitle>{activity ? TIMELINE_COPY.editActivity : TIMELINE_COPY.otherActivity}</IonTitle>
          <IonButtons slot="end">
            <IonButton strong disabled={!valid} onClick={() => void submit()}>
              {COMMON_COPY.save}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          <IonItem>
            <IonInput
              label={TIMELINE_COPY.activityName}
              placeholder={TIMELINE_COPY.activityNamePlaceholder}
              value={name}
              onIonInput={(event) => typeof event.detail.value === 'string' && setName(event.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label={COMMON_COPY.location}
              placeholder={TIMELINE_COPY.locationPlaceholder}
              value={location}
              onIonInput={(event) => typeof event.detail.value === 'string' && setTypedLocation(event.detail.value)}
            />
          </IonItem>
        </IonList>
        <ActivityNameSuggestions names={names} typed={name} onPick={setName} />
        <IonList inset>
          <PastTimeItems value={pastTime} now={now} onChange={setPastTime} />
        </IonList>
        <PastTimeNotes problems={problems} />
      </IonContent>
    </>
  )
}

export function ActivityModal({ isOpen, activity, onClose }: FormProps & { isOpen: boolean }) {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <ActivityForm activity={activity} onClose={onClose} />
    </IonModal>
  )
}
