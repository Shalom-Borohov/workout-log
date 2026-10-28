import { IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react'
import { exerciseResult, formatSets } from '../../domain/format'
import type { WorkoutSection } from '../../domain/types'

export function WorkoutSections({ sections }: { sections: WorkoutSection[] }) {
  return sections.map((section, index) => (
    <section key={index}>
      <IonListHeader>
        <IonLabel>{section.name}</IonLabel>
      </IonListHeader>
      <IonList inset>
        {section.items.flatMap((item) =>
          item.exercises.map((exercise) => (
            <IonItem key={`${item.id}-${exercise.name}`}>
              <IonLabel className="ion-text-wrap workout-exercise">
                <h3 className="workout-exercise-name">{exercise.name}</h3>
                <p className="workout-exercise-sets">{exerciseResult(exercise, formatSets)}</p>
              </IonLabel>
            </IonItem>
          )),
        )}
      </IonList>
    </section>
  ))
}
