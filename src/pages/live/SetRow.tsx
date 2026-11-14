import { IonItem, IonItemOption, IonItemOptions, IonItemSliding } from '@ionic/react'
import { useRef } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { LIVE_COPY } from './copy'
import { formatSet } from '../../domain/format'
import type { SetLog, Target } from '../../domain/types'
import { CurrentSet } from './CurrentSet'
import { SetCheck } from '../../components/SetCheck'

interface SetRowProps {
  title: string
  label: string
  target: Target
  set: SetLog
  current: boolean
  canRemove: boolean
  onSelect: () => void
  onChange: (patch: Partial<SetLog>) => void
  onDuplicate: () => void
  onRemove: () => void
}

export function SetRow({ title, label, target, set, current, canRemove, onSelect, onChange, onDuplicate, onRemove }: SetRowProps) {
  const sliding = useRef<HTMLIonItemSlidingElement>(null)

  function act(action: () => void) {
    void sliding.current?.close()
    action()
  }

  return (
    <IonItemSliding ref={sliding} className="set-sliding">
      {current ? (
        <IonItem className="set-row set-row-current">
          <CurrentSet title={title} label={label} target={target} set={set} onChange={onChange} />
        </IonItem>
      ) : (
        <IonItem className={set.done ? 'set-row set-done' : 'set-row'}>
          <button type="button" className="plain-button set-select" onClick={onSelect}>
            <span className="set-title">{title}</span>
            <span className="set-value">{formatSet(set, target)}</span>
          </button>
          <SetCheck label={label} done={set.done} size="small" onToggle={() => onChange({ done: !set.done })} />
        </IonItem>
      )}
      <IonItemOptions side="end">
        <IonItemOption color="medium" onClick={() => act(onDuplicate)}>
          {LIVE_COPY.duplicateSet}
        </IonItemOption>
        {canRemove && (
          <IonItemOption color="danger" expandable onClick={() => act(onRemove)}>
            {COMMON_COPY.delete}
          </IonItemOption>
        )}
      </IonItemOptions>
    </IonItemSliding>
  )
}
