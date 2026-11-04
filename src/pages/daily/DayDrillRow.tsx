import { IonItem, IonLabel } from '@ionic/react'
import { useState } from 'react'
import { SetCheck } from '../../components/SetCheck'
import { toggleDailyLog, updateDailyLog } from '../../data/repo'
import { newDailyLog, updateDailyExercise } from '../../domain/daily'
import type { DailyDay } from '../../domain/dailyCalendar'
import { formatDay } from '../../domain/format'
import type { DailyExercise, DailyLog, Routine } from '../../domain/types'
import { DAILY_COPY } from './copy'
import { DrillName } from './DrillName'
import { DrillSteppers } from './DrillSteppers'
import { DrillToggle } from './DrillToggle'

interface DayDrillRowProps {
  routine: Routine
  day: DailyDay
  log: DailyLog | undefined
}

export function DayDrillRow({ routine, day, log }: DayDrillRowProps) {
  const [edited, setEdited] = useState<DailyLog | null>(null)
  const [expanded, setExpanded] = useState(false)
  const current = log && (edited ?? log)

  function toggle() {
    setEdited(null)
    setExpanded(false)
    void toggleDailyLog(newDailyLog(routine, day.date))
  }

  function change(done: DailyLog, index: number, patch: Partial<DailyExercise>) {
    const next = updateDailyExercise(done, index, patch)

    setEdited(next)
    void updateDailyLog(next)
  }

  return (
    <>
      <IonItem>
        {current ? (
          <DrillToggle routine={routine} log={current} expanded={expanded} onToggle={() => setExpanded(!expanded)} />
        ) : (
          <IonLabel>
            <DrillName routine={routine} />
          </IonLabel>
        )}
        <SetCheck label={DAILY_COPY.onDay(routine.name, formatDay(day.day))} done={log !== undefined} size="small" onToggle={toggle} />
      </IonItem>
      {current &&
        expanded &&
        current.exercises.map((exercise, index) => (
          <DrillSteppers
            key={index}
            exercise={exercise}
            named={current.exercises.length > 1}
            onChange={(patch) => change(current, index, patch)}
          />
        ))}
    </>
  )
}
