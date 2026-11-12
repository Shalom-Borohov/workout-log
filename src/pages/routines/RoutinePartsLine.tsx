import { Fragment } from 'react'
import { LIST_SEPARATOR } from '../../domain/format'
import { routineParts, routinePartsLine } from '../../domain/routineParts'
import type { Routine } from '../../domain/types'

export function RoutinePartsLine({ routine }: { routine: Routine }) {
  return (
    <p className="routine-parts">
      <span className="visually-hidden">{routinePartsLine(routine)}</span>
      <span aria-hidden="true">
        {routineParts(routine).map((part, index) => (
          <Fragment key={index}>
            {index > 0 && LIST_SEPARATOR}
            {part.name} <span className="routine-part-count">{part.exercises}</span>
          </Fragment>
        ))}
      </span>
    </p>
  )
}
