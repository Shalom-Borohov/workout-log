import { IonDatetime, IonDatetimeButton, IonInput, IonItem, IonLabel, IonModal, IonNote } from '@ionic/react'
import { DurationMinutesItem } from '../../components/DurationMinutesItem'
import { TIMELINE_COPY } from './copy'
import { isoDate } from '../../domain/format'
import { MAX_DURATION_MINUTES, type PastTimeProblems } from '../../domain/pastTime'
import { clockTime, type PastTime } from './pastTimeForm'

const START_TIME_ID = 'past-start-time'

interface ItemsProps {
  value: PastTime
  now: number
  onChange: (value: PastTime) => void
}

export function PastTimeItems({ value, now, onChange }: ItemsProps) {
  const update = (change: Partial<PastTime>) => onChange({ ...value, ...change })

  return (
    <>
      <IonItem>
        <IonInput
          label={TIMELINE_COPY.date}
          type="date"
          max={isoDate(now)}
          value={value.date}
          onIonInput={(event) => typeof event.detail.value === 'string' && update({ date: event.detail.value })}
        />
      </IonItem>
      <IonItem>
        <IonLabel>{TIMELINE_COPY.startTime}</IonLabel>
        <IonDatetimeButton slot="end" datetime={START_TIME_ID} />
      </IonItem>
      <IonModal keepContentsMounted>
        <IonDatetime
          id={START_TIME_ID}
          presentation="time"
          hourCycle="h23"
          value={value.time}
          onIonChange={(event) => {
            const time = clockTime(event.detail.value)
            if (time) {
              update({ time })
            }
          }}
        />
      </IonModal>
      <DurationMinutesItem value={value.duration} onChange={(duration) => update({ duration })} />
    </>
  )
}

export function PastTimeNotes({ problems }: { problems: PastTimeProblems }) {
  return (
    <>
      {problems.inFuture && (
        <IonNote color="danger" className="list-footer">
          {TIMELINE_COPY.startTimeMustBePast}
        </IonNote>
      )}
      {problems.endsAfterNow && (
        <IonNote color="danger" className="list-footer">
          {TIMELINE_COPY.mustEndByNow}
        </IonNote>
      )}
      {problems.tooLong && (
        <IonNote color="danger" className="list-footer">
          {TIMELINE_COPY.maxDuration(MAX_DURATION_MINUTES)}
        </IonNote>
      )}
    </>
  )
}
