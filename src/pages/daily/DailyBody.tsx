import { IonIcon, IonList, useIonRouter } from '@ionic/react'
import { chevronBack } from 'ionicons/icons'
import { useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { logDailyDay } from '../../data/repo'
import { findDailyLog, newDailyLog } from '../../domain/daily'
import { type DailyDay, dayDrills, monthStart, quickLogDrill, recordDates, shiftMonth } from '../../domain/dailyCalendar'
import { isoDate } from '../../domain/format'
import type { DailyLog, Routine, WorkoutRecord } from '../../domain/types'
import { useSave } from '../../hooks/useSave'
import { DAILY_ARCHIVE_PATH } from '../../navigation/paths'
import { DAILY_COPY } from './copy'
import { DailyRoutineRow } from './DailyRoutineRow'
import { DaySheet } from './DaySheet'
import { MonthCalendar } from './MonthCalendar'

interface DailyBodyProps {
  routines: Routine[]
  logs: DailyLog[]
  records: WorkoutRecord[]
  now: number
}

export function DailyBody({ routines, logs, records, now }: DailyBodyProps) {
  const [monthsBack, setMonthsBack] = useState(0)
  const [openDay, setOpenDay] = useState<DailyDay | null>(null)
  const router = useIonRouter()
  const { save } = useSave()
  const daily = routines.filter((routine) => routine.daily)
  const active = daily.filter((routine) => !routine.archived)
  const today = isoDate(now)
  const workoutDates = recordDates(records)
  const quickDrill = (date: string) => quickLogDrill(routines, logs, workoutDates, date)

  if (daily.length === 0) {
    return <EmptyState title={DAILY_COPY.emptyTitle} body={DAILY_COPY.emptyBody} />
  }

  function tapDay(day: DailyDay) {
    const drill = quickDrill(day.date)

    if (drill) {
      void save(() => logDailyDay(newDailyLog(drill, day.date)))

      return
    }

    setOpenDay(day)
  }

  return (
    <>
      {active.length > 0 && (
        <IonList className="list-plates daily-routines">
          {active.map((routine) => (
            <DailyRoutineRow key={routine.id} routine={routine} log={findDailyLog(logs, routine.id, today)} />
          ))}
        </IonList>
      )}
      {active.length < daily.length && (
        <button
          type="button"
          className="plain-button plate-outline daily-archive-link"
          onClick={() => router.push(DAILY_ARCHIVE_PATH)}
        >
          {DAILY_COPY.archived}
          <IonIcon icon={chevronBack} aria-hidden="true" />
        </button>
      )}
      <MonthCalendar
        drills={dayDrills(logs, routines)}
        workoutDates={workoutDates}
        month={shiftMonth(monthStart(now), -monthsBack)}
        now={now}
        opensSheet={(date) => quickDrill(date) === undefined}
        onMonthsBack={(change) => setMonthsBack((current) => current + change)}
        onTapDay={tapDay}
      />
      <DaySheet day={openDay} routines={routines} logs={logs} records={records} onClose={() => setOpenDay(null)} />
    </>
  )
}
