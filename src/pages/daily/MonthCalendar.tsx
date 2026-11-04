import { IonButton, IonIcon } from '@ionic/react'
import { chevronBack, chevronForward } from 'ionicons/icons'
import { useState } from 'react'
import { DrillDot } from '../../components/DrillDot'
import { FORMAT_COPY } from '../../copy/format'
import { type DailyDay, monthGrid, monthStart } from '../../domain/dailyCalendar'
import { formatDay } from '../../domain/format'
import type { Routine } from '../../domain/types'
import { DAILY_COPY } from './copy'
import { useMonthSwipe } from './useMonthSwipe'

const MAX_DAY_DOTS = 4

interface MonthCalendarProps {
  drills: Map<string, Routine[]>
  workoutDates: Set<string>
  month: number
  now: number
  opensSheet: (date: string) => boolean
  onMonthsBack: (change: number) => void
  onTapDay: (day: DailyDay) => void
}

export function MonthCalendar({ drills, workoutDates, month, now, opensSheet, onMonthsBack, onTapDay }: MonthCalendarProps) {
  const shown = new Date(month)
  const atLatest = month >= monthStart(now)
  const [slide, setSlide] = useState<'back' | 'forward' | undefined>(undefined)

  function move(change: number) {
    if (change < 0 && atLatest) {
      return
    }
    setSlide(change > 0 ? 'back' : 'forward')
    onMonthsBack(change)
  }

  const swipe = useMonthSwipe(move)

  return (
    <section className="month-calendar" {...swipe}>
      <div className="month-header">
        <IonButton fill="clear" aria-label={DAILY_COPY.previousMonth} onClick={() => move(1)}>
          <IonIcon slot="icon-only" icon={chevronForward} />
        </IonButton>
        <h2 className="month-title">{DAILY_COPY.monthTitle(DAILY_COPY.months[shown.getMonth()], shown.getFullYear())}</h2>
        <IonButton
          fill="clear"
          aria-label={DAILY_COPY.nextMonth}
          disabled={atLatest}
          onClick={() => move(-1)}
        >
          <IonIcon slot="icon-only" icon={chevronBack} />
        </IonButton>
      </div>
      <div key={month} className="month-grid" data-slide={slide} onAnimationEnd={() => setSlide(undefined)}>
        {FORMAT_COPY.weekdays.map((weekday) => (
          <span key={weekday} className="month-weekday" aria-hidden="true">
            {weekday}
          </span>
        ))}
        {monthGrid(month, now).map((cell, index) => {
          if (cell === null) {
            return <span key={index} />
          }
          const done = drills.get(cell.date) ?? []
          const workedOut = workoutDates.has(cell.date)

          return (
            <button
              key={cell.date}
              type="button"
              className="plain-button month-day"
              aria-label={DAILY_COPY.dayLabel(formatDay(cell.day), done.map((routine) => routine.name), workedOut)}
              aria-haspopup={opensSheet(cell.date) ? 'dialog' : undefined}
              aria-current={cell.today ? 'date' : false}
              disabled={cell.future}
              onClick={() => onTapDay(cell)}
            >
              <span className="month-day-number">{new Date(cell.day).getDate()}</span>
              <span className="month-day-dots" aria-hidden="true">
                {done.slice(0, MAX_DAY_DOTS).map((routine) => (
                  <DrillDot key={routine.id} color={routine.color} />
                ))}
                {workedOut && <DrillDot color={null} />}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
