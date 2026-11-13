import { routineParts, routinePartsLine } from '../../domain/routineParts'
import type { Routine } from '../../domain/types'

export function RoutinePartsTable({ routine }: { routine: Routine }) {
  const parts = routineParts(routine)

  return (
    <div className="routine-parts">
      <span className="visually-hidden">{routinePartsLine(parts)}</span>
      <div className="routine-parts-table" aria-hidden="true">
        {parts.map((part, index) => (
          <div key={index} className="routine-part">
            <span className="routine-part-name">{part.name}</span>
            <span className="routine-part-count">{part.exercises}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
