import { IonIcon } from '@ionic/react'
import { checkmarkCircle, ellipseOutline } from 'ionicons/icons'
import type { MouseEvent } from 'react'
import './SetCheck.css'

interface SetCheckProps {
  label: string
  done: boolean
  size: 'large' | 'small'
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void
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
      <IonIcon icon={done ? checkmarkCircle : ellipseOutline} />
    </button>
  )
}
