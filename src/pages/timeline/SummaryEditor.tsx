import { IonItem, IonLabel, IonList, IonListHeader, IonTextarea, type TextareaCustomEvent } from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { TIMELINE_COPY } from './copy'
import { saveWorkout } from '../../data/repo'
import type { Workout } from '../../domain/types'

export function SummaryEditor({ workout }: { workout: Workout }) {
  function handleChange(event: TextareaCustomEvent) {
    const { value } = event.detail
    if (typeof value !== 'string') {
      return
    }
    void saveWorkout({ ...workout, summary: value.trim() })
  }

  return (
    <section>
      <IonListHeader>
        <IonLabel>{COMMON_COPY.summary}</IonLabel>
      </IonListHeader>
      <IonList inset>
        <IonItem>
          <IonTextarea
            aria-label={COMMON_COPY.summary}
            autoGrow
            placeholder={TIMELINE_COPY.addSummaryPlaceholder}
            value={workout.summary}
            onIonChange={handleChange}
          />
        </IonItem>
      </IonList>
    </section>
  )
}
