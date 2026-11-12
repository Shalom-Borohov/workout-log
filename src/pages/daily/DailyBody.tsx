import { useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { logDailyDay } from '../../data/repo'
import { newDailyLog } from '../../domain/daily'
import { type DailyDay, dayDrills, monthStart, quickLogDrill, recordDates, shiftMonth } from '../../domain/dailyCalendar'
import type { DailyLog, Routine, WorkoutRecord } from '../../domain/types'
import { useSave } from '../../hooks/useSave'
import { DAILY_COPY } from './copy'
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
  const { save } = useSave()
  const workoutDates = recordDates(records)
  const quickDrill = (date: string) => quickLogDrill(routines, logs, workoutDates, date)

  if (!routines.some((routine) => routine.daily)) {
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
