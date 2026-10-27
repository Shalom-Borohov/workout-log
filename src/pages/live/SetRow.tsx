import { IonItem } from '@ionic/react'
import { formatSet } from '../../domain/format'
import type { SetLog, Target } from '../../domain/types'
import { CurrentSet } from './CurrentSet'
import { SetCheck } from './SetCheck'

interface SetRowProps {
  title: string
  label: string
  target: Target
  set: SetLog
  current: boolean
  onSelect: () => void
  onChange: (patch: Partial<SetLog>) => void
}

export function SetRow({ title, label, target, set, current, onSelect, onChange }: SetRowProps) {
  if (current) {
    return (
      <IonItem className="set-row set-row-current">
        <CurrentSet title={title} label={label} target={target} set={set} onChange={onChange} />
      </IonItem>
    )
  }

  return (
    <IonItem className={set.done ? 'set-row set-done' : 'set-row'}>
      <button type="button" className="plain-button set-select" onClick={onSelect}>
        <span className="set-title">{title}</span>
        <span className="set-value">{formatSet(set, target)}</span>
      </button>
      <SetCheck label={label} done={set.done} size="small" onToggle={() => onChange({ done: !set.done })} />
    </IonItem>
  )
}
