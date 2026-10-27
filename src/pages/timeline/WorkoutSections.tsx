import { IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react'
import { formatSets } from '../../domain/format'
import { completedSets } from '../../domain/progress'
import type { WorkoutExercise, WorkoutSection } from '../../domain/types'

function setsText(e: WorkoutExercise): string {
  if (e.skipped) {
    return 'דילגת'
  }
  const sets = completedSets(e)

  return sets.length > 0 ? formatSets(sets, e.target) : 'לא בוצע'
}

export function WorkoutSections({ sections }: { sections: WorkoutSection[] }) {
  return sections.map((section, index) => (
    <section key={index}>
      <IonListHeader>
        <IonLabel>{section.name}</IonLabel>
      </IonListHeader>
      <IonList inset>
        {section.items.flatMap((item) =>
          item.exercises.map((e) => (
            <IonItem key={`${item.id}-${e.name}`}>
              <IonLabel className="ion-text-wrap workout-exercise">
                <h3 className="workout-exercise-name">{e.name}</h3>
                <p className="workout-exercise-sets">{setsText(e)}</p>
              </IonLabel>
            </IonItem>
          )),
        )}
      </IonList>
    </section>
  ))
}
