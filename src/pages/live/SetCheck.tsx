import { IonIcon } from '@ionic/react'
import { checkmarkCircle, ellipseOutline } from 'ionicons/icons'

interface SetCheckProps {
  label: string
  done: boolean
  size: 'large' | 'small'
  onToggle: () => void
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
