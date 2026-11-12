import { useIonRouter } from '@ionic/react'
import { recordName } from '../../domain/activities'
import { formatDay, LIST_SEPARATOR, weekdayLetter } from '../../domain/format'
import type { WeekDay } from '../../domain/timeline'
import { TIMELINE_PATH, workoutDetailPath } from '../../navigation/paths'
import './dayStrip.css'

function tileClass(day: WeekDay): string {
  const states = [`day-tile-${day.kind}`, day.isToday && 'day-tile-today', day.isFuture && 'day-tile-future']

  return ['day-tile', ...states.filter(Boolean)].join(' ')
}

const currentDate = (day: WeekDay) => (day.isToday ? 'date' : false)

function TileFace({ date }: { date: number }) {
  return (
    <>
      <span aria-hidden="true" className="day-tile-weekday">
        {weekdayLetter(date)}
      </span>
      <span aria-hidden="true" className="day-tile-number">
        {new Date(date).getDate()}
      </span>
    </>
  )
}

function DayTile({ day, onOpen }: { day: WeekDay; onOpen: (id: string) => void }) {
  const { record } = day

  if (record === null) {
    return (
      <span className={tileClass(day)} aria-current={currentDate(day)}>
        <span className="visually-hidden">{formatDay(day.date)}</span>
        <TileFace date={day.date} />
      </span>
    )
  }

  return (
    <button
      type="button"
      className={`plain-button ${tileClass(day)}`}
      aria-current={currentDate(day)}
      aria-label={[formatDay(day.date), recordName(record)].join(LIST_SEPARATOR)}
      onClick={() => onOpen(record.id)}
    >
      <TileFace date={day.date} />
    </button>
  )
}

export function DayStrip({ days, labelledBy }: { days: WeekDay[]; labelledBy: string }) {
  const router = useIonRouter()
  const open = (id: string) => router.push(workoutDetailPath(TIMELINE_PATH, id))

  return (
    <ol role="list" className="day-strip" aria-labelledby={labelledBy}>
      {days.map((day) => (
        <li key={day.date}>
          <DayTile day={day} onOpen={open} />
        </li>
      ))}
    </ol>
  )
}
