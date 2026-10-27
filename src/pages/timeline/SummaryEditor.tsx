import { IonItem, IonLabel, IonList, IonListHeader, IonTextarea, type TextareaCustomEvent } from '@ionic/react'
import { saveWorkout } from '../../data/repo'
import type { Workout } from '../../domain/types'

export function SummaryEditor({ workout }: { workout: Workout }) {
  function handleChange(e: TextareaCustomEvent) {
    const { value } = e.detail
    if (typeof value !== 'string') {
      return
    }
    void saveWorkout({ ...workout, summary: value.trim() })
  }

  return (
    <section>
      <IonListHeader>
        <IonLabel>סיכום</IonLabel>
      </IonListHeader>
      <IonList inset>
        <IonItem>
          <IonTextarea
            aria-label="סיכום"
            autoGrow
            placeholder="הוספת סיכום…"
            value={workout.summary}
            onIonChange={handleChange}
          />
        </IonItem>
      </IonList>
    </section>
  )
}
