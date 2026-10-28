import { IonIcon } from '@ionic/react'
import { arrowUp, star } from 'ionicons/icons'
import { APP_COPY } from '../copy/app'
import './ChangeBadge.css'

const BADGES = {
  up: { icon: arrowUp, label: APP_COPY.improvement },
  record: { icon: star, label: APP_COPY.newRecord },
} as const

export function ChangeBadge({ kind, label }: { kind: keyof typeof BADGES; label?: string }) {
  const badge = BADGES[kind]

  return (
    <span className={`change-badge change-badge-${kind}`}>
      <IonIcon icon={badge.icon} aria-label={badge.label} />
      {label}
    </span>
  )
}
