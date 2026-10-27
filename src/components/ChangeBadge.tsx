import { IonIcon } from '@ionic/react'
import { arrowUp, star } from 'ionicons/icons'
import './ChangeBadge.css'

const BADGES = {
  up: { icon: arrowUp, label: 'שיפור' },
  record: { icon: star, label: 'שיא חדש' },
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
