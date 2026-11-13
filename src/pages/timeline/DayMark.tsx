import { formatDay, LIST_MARK, weekdayLetter } from '../../domain/format'
import type { WorkoutRecord } from '../../domain/types'

export function DayMark({ record }: { record: WorkoutRecord }) {
  return (
    <span className={`day-mark day-mark-${record.kind}`}>
      <span className="visually-hidden">{formatDay(record.startedAt)}</span>
      <span aria-hidden="true" className="day-mark-weekday">
        {weekdayLetter(record.startedAt)}
      </span>
      <span aria-hidden="true" className="day-mark-day">
        {new Date(record.startedAt).getDate()}
      </span>
      <span aria-hidden="true">{LIST_MARK}</span>
    </span>
  )
}
