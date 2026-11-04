import { formatDay, weekdayLetter } from '../../domain/format'
import type { WorkoutRecord } from '../../domain/types'

export function DateColumn({ record }: { record: WorkoutRecord }) {
  return (
    <div slot="start" className={`date-column date-column-${record.kind}`}>
      <span className="date-column-label">{formatDay(record.startedAt)}</span>
      <span aria-hidden="true" className="date-column-weekday">
        {weekdayLetter(record.startedAt)}
      </span>
      <span aria-hidden="true" className="date-column-day">
        {new Date(record.startedAt).getDate()}
      </span>
    </div>
  )
}
