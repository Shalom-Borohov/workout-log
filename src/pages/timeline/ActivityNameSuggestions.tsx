import { IonItem, IonLabel, IonList } from '@ionic/react'
import { useMemo } from 'react'
import { useFinishedRecords } from '../../data/hooks'
import { activityNames } from '../../domain/activities'

interface Props {
  typed: string
  onPick: (name: string) => void
}

export function ActivityNameSuggestions({ typed, onPick }: Props) {
  const records = useFinishedRecords()
  const names = useMemo(() => (records ? activityNames(records) : []), [records])
  const trimmed = typed.trim()
  const needle = trimmed.toLowerCase()
  const matching = names.filter((name) => name !== trimmed && name.toLowerCase().includes(needle))

  if (matching.length === 0) {
    return null
  }

  return (
    <IonList inset>
      {matching.map((name) => (
        <IonItem key={name} button detail={false} onClick={() => onPick(name)}>
          <IonLabel>{name}</IonLabel>
        </IonItem>
      ))}
    </IonList>
  )
}
