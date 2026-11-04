import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react'
import { useRef } from 'react'
import { HALF_SHEET } from '../../components/sheet'
import { COMMON_COPY } from '../../copy/common'
import { findDailyLog } from '../../domain/daily'
import { type DailyDay, recordsOn, sheetDrills } from '../../domain/dailyCalendar'
import { formatDay } from '../../domain/format'
import type { DailyLog, Routine, WorkoutRecord } from '../../domain/types'
import { DAILY_PATH, workoutDetailPath } from '../../navigation/paths'
import { DAILY_COPY } from './copy'
import { DayDrillRow } from './DayDrillRow'
import { DayRecordRow } from './DayRecordRow'

interface DaySheetProps {
  day: DailyDay | null
  routines: Routine[]
  logs: DailyLog[]
  records: WorkoutRecord[]
  onClose: () => void
}

export function DaySheet({ day, routines, logs, records, onClose }: DaySheetProps) {
  const modal = useRef<HTMLIonModalElement>(null)
  const router = useIonRouter()
  const drills = day ? sheetDrills(routines, logs, day.date) : []
  const dayRecords = day ? recordsOn(records, day.date) : []

  async function openRecord(id: string) {
    await modal.current?.dismiss()
    router.push(workoutDetailPath(DAILY_PATH, id))
  }

  return (
    <IonModal ref={modal} isOpen={day !== null} onDidDismiss={onClose} {...HALF_SHEET}>
      {day && (
        <>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{formatDay(day.day)}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => void modal.current?.dismiss()}>{COMMON_COPY.close}</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {drills.length > 0 && (
              <IonList inset>
                {drills.map((routine) => (
                  <DayDrillRow
                    key={routine.id}
                    routine={routine}
                    day={day}
                    log={findDailyLog(logs, routine.id, day.date)}
                  />
                ))}
              </IonList>
            )}
            {dayRecords.length > 0 && (
              <IonList inset>
                <IonListHeader>
                  <IonLabel>{DAILY_COPY.records}</IonLabel>
                </IonListHeader>
                {dayRecords.map((record) => (
                  <DayRecordRow key={record.id} record={record} onOpen={() => void openRecord(record.id)} />
                ))}
              </IonList>
            )}
          </IonContent>
        </>
      )}
    </IonModal>
  )
}
