import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react'
import { useRef } from 'react'
import { NamedModal } from '../../components/NamedModal'
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

  async function openRecord(id: string) {
    await modal.current?.dismiss()
    router.push(workoutDetailPath(DAILY_PATH, id))
  }

  if (day === null) {
    return null
  }
  const title = formatDay(day.day)
  const drills = sheetDrills(routines, logs, day.date)
  const dayRecords = recordsOn(records, day.date)

  return (
    <NamedModal label={title} ref={modal} isOpen onDidDismiss={onClose} {...HALF_SHEET}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
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
    </NamedModal>
  )
}
