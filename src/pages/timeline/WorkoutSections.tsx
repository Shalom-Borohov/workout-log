import { IonItem, IonLabel, IonList } from '@ionic/react'
import { ChangeBadge } from '../../components/ChangeBadge'
import { exerciseResult, formatChange, formatSets } from '../../domain/format'
import { type Change, exercisesOf } from '../../domain/progress'
import { changeHolders } from '../../domain/timeline'
import type { WorkoutExercise, WorkoutSection } from '../../domain/types'

function ExerciseRow({ exercise, change }: { exercise: WorkoutExercise; change: Change | undefined }) {
  return (
    <IonItem className="workout-exercise-item">
      <IonLabel className="ion-text-wrap workout-exercise">
        <div className="workout-exercise-heading">
          <h3 className="workout-exercise-name">{exercise.name}</h3>
          {change && <ChangeBadge kind={change.kind} label={formatChange(change)} />}
        </div>
        <p className="workout-exercise-sets">{exerciseResult(exercise, formatSets)}</p>
      </IonLabel>
    </IonItem>
  )
}

export function WorkoutSections({ sections, changes }: { sections: WorkoutSection[]; changes: Change[] }) {
  const holders = changeHolders(exercisesOf({ sections }), changes)

  return sections.map((section, index) => (
    <section key={index}>
      <h2 className="workout-part-title">{section.name}</h2>
      <IonList inset>
        {section.items.flatMap((item) =>
          item.exercises.map((exercise) => (
            <ExerciseRow
              key={`${item.id}-${exercise.name}`}
              exercise={exercise}
              change={holders.get(exercise)}
            />
          )),
        )}
      </IonList>
    </section>
  ))
}
