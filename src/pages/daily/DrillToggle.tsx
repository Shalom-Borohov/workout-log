import { IonIcon } from '@ionic/react'
import { chevronDown } from 'ionicons/icons'
import { DrillDot } from '../../components/DrillDot'
import { logLine } from '../../domain/daily'
import type { DailyLog, Routine } from '../../domain/types'

interface DrillToggleProps {
  routine: Routine
  log: DailyLog
  expanded: boolean
  onToggle: () => void
}

export function DrillToggle({ routine, log, expanded, onToggle }: DrillToggleProps) {
  return (
    <button type="button" className="plain-button daily-drill-toggle" aria-expanded={expanded} onClick={onToggle}>
      <span className="daily-drill-text">
        <span className="daily-name daily-drill-name">
          <DrillDot color={routine.color} />
          {routine.name}
        </span>
        <span className="daily-drill-summary">{logLine(log.exercises)}</span>
      </span>
      <IonIcon className="daily-drill-chevron" icon={chevronDown} aria-hidden="true" />
    </button>
  )
}
