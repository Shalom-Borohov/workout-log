import { IonIcon, useIonRouter } from '@ionic/react'
import { checkmark } from 'ionicons/icons'
import type { MouseEvent } from 'react'
import { DrillDot } from '../../components/DrillDot'
import { drillColorStyle } from '../../components/drillColorStyle'
import { drillsLine } from '../../domain/daily'
import { isoDate } from '../../domain/format'
import type { DailyLog, Routine } from '../../domain/types'
import { DAILY_PATH, routinePath } from '../../navigation/paths'
import { DAILY_COPY } from './copy'
import { useToggleDailyLog } from './useToggleDailyLog'

interface RoutineTileProps {
  routine: Routine
  log: DailyLog | undefined
}

export function RoutineTile({ routine, log }: RoutineTileProps) {
  const router = useIonRouter()
  const toggleLog = useToggleDailyLog(routine)
  const drills = drillsLine(routine)
  const done = log !== undefined

  function toggle(event: MouseEvent) {
    event.stopPropagation()
    const today = isoDate(Date.now())

    toggleLog(today, log?.date === today ? log : undefined)
  }

  return (
    <div
      className={done ? 'routine-tile routine-tile-done' : 'routine-tile'}
      style={routine.color ? drillColorStyle(routine.color) : undefined}
      onClick={() => router.push(routinePath(DAILY_PATH, routine.id))}
    >
      <h2 className="routine-tile-name">
        {!done && <DrillDot color={routine.color} />}
        {routine.name}
      </h2>
      {drills && <p className="routine-tile-drills">{drills}</p>}
      <button type="button" className="plain-button routine-tile-button" aria-label={routine.name} />
      <button
        type="button"
        className="plain-button routine-tile-check"
        aria-label={DAILY_COPY.today(routine.name)}
        aria-pressed={done}
        onClick={toggle}
      >
        {done ? <IonIcon icon={checkmark} aria-hidden="true" /> : <span className="routine-tile-ring" aria-hidden="true" />}
      </button>
    </div>
  )
}
