import { IonItem, IonLabel, useIonRouter } from '@ionic/react'
import type { MouseEvent } from 'react'
import { SetCheck } from '../../components/SetCheck'
import { toggleDailyLog } from '../../data/repo'
import { drillsLine, newDailyLog } from '../../domain/daily'
import { isoDate } from '../../domain/format'
import type { Routine } from '../../domain/types'
import { DAILY_PATH, routinePath } from '../../navigation/paths'
import { DAILY_COPY } from './copy'

interface TodayCardProps {
  routine: Routine
  done: boolean
}

export function TodayCard({ routine, done }: TodayCardProps) {
  const router = useIonRouter()
  const drills = drillsLine(routine)

  function toggle(event: MouseEvent) {
    event.stopPropagation()
    void toggleDailyLog(newDailyLog(routine.id, isoDate(Date.now())))
  }

  return (
    <IonItem button detail={false} onClick={() => router.push(routinePath(DAILY_PATH, routine.id))}>
      <IonLabel>
        <h2>{routine.name}</h2>
        {drills && <p>{drills}</p>}
      </IonLabel>
      <SetCheck label={DAILY_COPY.today(routine.name)} done={done} size="small" onToggle={toggle} />
    </IonItem>
  )
}
