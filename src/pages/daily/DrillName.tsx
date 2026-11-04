import { DrillDot } from '../../components/DrillDot'
import type { Routine } from '../../domain/types'

export function DrillName({ routine }: { routine: Routine }) {
  return (
    <h2 className="daily-name">
      <DrillDot color={routine.color} />
      {routine.name}
    </h2>
  )
}
