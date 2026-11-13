import { IonItemOption, IonItemOptions, IonItemSliding, IonLabel, useIonRouter } from '@ionic/react'
import type { MouseEvent } from 'react'
import { ButtonRow } from '../../components/ButtonRow'
import { drillColorStyle } from '../../components/drillColorStyle'
import { SetCheck } from '../../components/SetCheck'
import { updateRoutine } from '../../data/repo'
import { drillsLine } from '../../domain/daily'
import { isoDate } from '../../domain/format'
import type { DailyLog, Routine } from '../../domain/types'
import { useSave } from '../../hooks/useSave'
import { DAILY_PATH, routinePath } from '../../navigation/paths'
import { DAILY_COPY } from './copy'
import { useToggleDailyLog } from './useToggleDailyLog'

interface DailyRoutineRowProps {
  routine: Routine
  log: DailyLog | undefined
}

export function DailyRoutineRow({ routine, log }: DailyRoutineRowProps) {
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
      <ButtonRow
        label={routine.name}
        onClick={() => router.push(routinePath(DAILY_PATH, routine.id))}
        controls={<SetCheck label={DAILY_COPY.today(routine.name)} done={log !== undefined} size="small" onToggle={toggle} />}
      >
        <span
          className="daily-routine-bar"
          style={routine.color ? drillColorStyle(routine.color) : undefined}
          aria-hidden="true"
        />
        <IonLabel className="daily-routine-label">
          <h2 className="daily-routine-name">{routine.name}</h2>
          {drills && <p className="daily-routine-drills">{drills}</p>}
        </IonLabel>
      </ButtonRow>
      <IonItemOptions side="end" onIonSwipe={archive}>
        <IonItemOption color="medium" expandable onClick={archive}>
          {DAILY_COPY.archive}
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  )
}
