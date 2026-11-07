import { IonInput, IonItem } from '@ionic/react'
import { COMMON_COPY } from '../copy/common'
import { MAX_DURATION_MINUTES, MIN_DURATION_MINUTES } from '../domain/pastTime'

interface DurationMinutesItemProps {
  value: string
  onChange: (value: string) => void
}

export function DurationMinutesItem({ value, onChange }: DurationMinutesItemProps) {
  return (
    <IonItem>
      <IonInput
        label={COMMON_COPY.durationMinutes}
        type="number"
        inputmode="numeric"
        min={MIN_DURATION_MINUTES}
        max={MAX_DURATION_MINUTES}
        value={value}
        onIonInput={(event) => typeof event.detail.value === 'string' && onChange(event.detail.value)}
      />
    </IonItem>
  )
}
