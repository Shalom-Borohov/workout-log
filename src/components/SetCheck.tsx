import { IonIcon } from '@ionic/react'
import { checkmark } from 'ionicons/icons'
import type { MouseEvent } from 'react'
import './SetCheck.css'

interface SetCheckProps {
  label: string
  done: boolean
  size: 'large' | 'small'
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void
}

function CheckMark({ size, done }: Pick<SetCheckProps, 'size' | 'done'>) {
  if (size === 'large') {
    return <IonIcon icon={checkmark} aria-hidden="true" />
  }

  return (
    <span className="set-check-mark" aria-hidden="true">
      {done && <IonIcon icon={checkmark} />}
    </span>
  )
}

export function SetCheck({ label, done, size, onToggle }: SetCheckProps) {
  return (
    <button
      type="button"
      className={`set-check set-check-${size}`}
      aria-label={label}
      aria-pressed={done}
      onClick={onToggle}
    >
      <CheckMark size={size} done={done} />
    </button>
  )
}
