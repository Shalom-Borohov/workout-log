import { IonItem, IonLabel, IonList } from '@ionic/react'

interface Props {
  names: string[]
  typed: string
  onPick: (name: string) => void
}

export function ActivityNameSuggestions({ names, typed, onPick }: Props) {
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
