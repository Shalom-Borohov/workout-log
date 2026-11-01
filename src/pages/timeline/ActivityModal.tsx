import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonModal, IonTitle, IonToolbar } from '@ionic/react'
import { useState } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { TIMELINE_COPY } from './copy'
import { saveRecord } from '../../data/repo'
import { pastTimeProblems } from '../../domain/pastTime'
import { MINUTE_MS } from '../../domain/time'
import type { Activity } from '../../domain/types'
import { useNow } from '../../hooks/useNow'
import { ActivityNameSuggestions } from './ActivityNameSuggestions'
import { PastTimeItems, PastTimeNotes } from './PastTimeFields'
import { defaultPastTime, pastTimeOf, readPastTime } from './pastTimeForm'

interface FormProps {
  activity: Activity | null
  onClose: () => void
}

function ActivityForm({ activity, onClose }: FormProps) {
  const now = useNow(MINUTE_MS)
  const [newId] = useState(() => crypto.randomUUID())
  const [name, setName] = useState(activity ? activity.name : '')
  const [pastTime, setPastTime] = useState(() => (activity ? pastTimeOf(activity) : defaultPastTime(now)))

  const { startedAt, minutes } = readPastTime(pastTime)
  const problems = pastTimeProblems(startedAt, minutes, now)
  const trimmedName = name.trim()
  const valid = trimmedName !== '' && problems.valid

  async function save() {
    const base: Pick<Activity, 'kind' | 'id' | 'summary'> = activity ?? { kind: 'activity', id: newId, summary: '' }

    await saveRecord({ ...base, name: trimmedName, startedAt, finishedAt: startedAt + minutes * MINUTE_MS })
    onClose()
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
            <IonButton strong disabled={!valid} onClick={() => void save()}>
              {COMMON_COPY.save}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent color="light">
        <IonList inset>
          <IonItem>
            <IonInput
              label={TIMELINE_COPY.activityName}
              placeholder={TIMELINE_COPY.activityNamePlaceholder}
              value={name}
              onIonInput={(event) => typeof event.detail.value === 'string' && setName(event.detail.value)}
            />
          </IonItem>
        </IonList>
        <ActivityNameSuggestions typed={name} onPick={setName} />
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
