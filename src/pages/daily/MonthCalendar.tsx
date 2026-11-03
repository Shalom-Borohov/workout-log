import { IonButton, IonIcon } from '@ionic/react'
import { chevronBack, chevronForward } from 'ionicons/icons'
import { FORMAT_COPY } from '../../copy/format'
import { toggleDailyLog } from '../../data/repo'
import { monthGrid, monthStart, newDailyLog } from '../../domain/daily'
import { formatDay } from '../../domain/format'
import { DAILY_COPY } from './copy'

interface MonthCalendarProps {
  routineId: string
  logged: Set<string>
  month: number
  now: number
  onMonthsBack: (change: number) => void
}

export function MonthCalendar({ routineId, logged, month, now, onMonthsBack }: MonthCalendarProps) {
  const shown = new Date(month)

  return (
    <section className="month-calendar">
      <div className="month-header">
        <IonButton fill="clear" aria-label={DAILY_COPY.previousMonth} onClick={() => onMonthsBack(1)}>
          <IonIcon slot="icon-only" icon={chevronForward} />
        </IonButton>
        <h2 className="month-title">{DAILY_COPY.monthTitle(DAILY_COPY.months[shown.getMonth()], shown.getFullYear())}</h2>
        <IonButton
          fill="clear"
          aria-label={DAILY_COPY.nextMonth}
          disabled={month >= monthStart(now)}
          onClick={() => onMonthsBack(-1)}
        >
          <IonIcon slot="icon-only" icon={chevronBack} />
        </IonButton>
      </div>
      <div className="month-grid">
        {FORMAT_COPY.weekdays.map((weekday) => (
          <span key={weekday} className="month-weekday" aria-hidden="true">
            {weekday}
          </span>
        ))}
        {monthGrid(month, logged, now).map((cell, index) =>
          cell === null ? (
            <span key={index} />
          ) : (
            <button
              key={cell.date}
              type="button"
              className="plain-button month-day"
              aria-label={formatDay(cell.day)}
              aria-pressed={cell.done}
              aria-current={cell.today ? 'date' : false}
              disabled={cell.future}
              onClick={() => void toggleDailyLog(newDailyLog(routineId, cell.date))}
            >
              <span className="month-day-number">{new Date(cell.day).getDate()}</span>
            </button>
          ),
        )}
      </div>
    </section>
  )
}
