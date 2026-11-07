import { IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, useIonRouter } from '@ionic/react'
import type { MouseEvent } from 'react'
import { SetCheck } from '../../components/SetCheck'
import { updateRoutine } from '../../data/repo'
import { drillsLine } from '../../domain/daily'
import { isoDate } from '../../domain/format'
import type { DailyLog, Routine } from '../../domain/types'
import { useSave } from '../../hooks/useSave'
import { DAILY_PATH, routinePath } from '../../navigation/paths'
import { DAILY_COPY } from './copy'
import { DrillName } from './DrillName'
import { useToggleDailyLog } from './useToggleDailyLog'

interface TodayCardProps {
  routine: Routine
  log: DailyLog | undefined
}

export function TodayCard({ routine, log }: TodayCardProps) {
  const router = useIonRouter()
  const drills = drillsLine(routine)
  const { save } = useSave()
  const toggleLog = useToggleDailyLog(routine)

  function toggle(event: MouseEvent) {
    event.stopPropagation()
    const today = isoDate(Date.now())

    toggleLog(today, log?.date === today ? log : undefined)
  }

  function archive() {
    void save(() => updateRoutine(routine.id, (current) => ({ ...current, archived: true })))
  }

  return (
    <IonItemSliding>
      <IonItem button detail={false} onClick={() => router.push(routinePath(DAILY_PATH, routine.id))}>
        <IonLabel>
          <DrillName routine={routine} />
          {drills && <p>{drills}</p>}
        </IonLabel>
        <SetCheck label={DAILY_COPY.today(routine.name)} done={log !== undefined} size="small" onToggle={toggle} />
      </IonItem>
      <IonItemOptions side="end" onIonSwipe={archive}>
        <IonItemOption color="medium" expandable onClick={archive}>
          {DAILY_COPY.archive}
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  )
}
