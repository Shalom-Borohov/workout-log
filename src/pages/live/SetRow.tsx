import { IonItem, IonItemOption, IonItemOptions, IonItemSliding } from '@ionic/react'
import { type ReactNode, useRef } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { LIVE_COPY } from './copy'
import { formatSet } from '../../domain/format'
import type { SetLog, Target } from '../../domain/types'
import { SetCheck } from '../../components/SetCheck'
import type { SetSlidingActions } from './slidingActions'

export function SetSliding({ canRemove, onDuplicate, onRemove, children }: SetSlidingActions & { children: ReactNode }) {
  const sliding = useRef<HTMLIonItemSlidingElement>(null)

  function act(action: () => void) {
    void sliding.current?.close()
    action()
  }

  return (
    <IonItemSliding ref={sliding} className="set-sliding">
      {children}
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

interface SetRowProps {
  title: string
  label: string
  target: Target
  set: SetLog
  onSelect: () => void
  onChange: (patch: Partial<SetLog>) => void
}

export function SetRow({ title, label, target, set, onSelect, onChange }: SetRowProps) {
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
