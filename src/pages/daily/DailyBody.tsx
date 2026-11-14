import { IonItem, IonLabel, IonList, IonNote } from '@ionic/react'
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
import { DaySheet } from './DaySheet'
import { MonthCalendar } from './MonthCalendar'
import { TodayCard } from './TodayCard'

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
  const daily = routines.filter((routine) => routine.daily)
  const active = daily.filter((routine) => !routine.archived)
  const archived = daily.length - active.length
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
        <IonList inset>
          {active.map((routine) => (
            <TodayCard key={routine.id} routine={routine} log={findDailyLog(logs, routine.id, today)} />
          ))}
        </IonList>
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
      {archived > 0 && (
        <IonList inset>
          <IonItem button detail routerLink={DAILY_ARCHIVE_PATH}>
            <IonLabel>{DAILY_COPY.archived}</IonLabel>
            <IonNote slot="end">{archived}</IonNote>
          </IonItem>
        </IonList>
      )}
      <DaySheet day={openDay} routines={routines} logs={logs} records={records} onClose={() => setOpenDay(null)} />
    </>
  )
}
