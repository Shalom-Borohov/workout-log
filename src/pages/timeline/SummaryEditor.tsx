import { IonItem, IonLabel, IonList, IonListHeader, IonTextarea, type TextareaCustomEvent } from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { TIMELINE_COPY } from './copy'
import { saveRecord } from '../../data/repo'
import type { WorkoutRecord } from '../../domain/types'
import { useSave } from '../../hooks/useSave'

export function SummaryEditor({ workout }: { workout: WorkoutRecord }) {
  const { save } = useSave()

  function handleChange(event: TextareaCustomEvent) {
    const { value } = event.detail
    if (typeof value !== 'string') {
      return
    }
    void save(() => saveRecord({ ...workout, summary: value.trim() }))
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
