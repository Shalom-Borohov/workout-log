import { IonItem, IonLabel, IonList } from '@ionic/react'
import { Fragment } from 'react'
import { ChangeBadge } from '../../components/ChangeBadge'
import { exerciseResult, formatChange, formatSet, LIST_MARK, LIST_SEPARATOR } from '../../domain/format'
import { type Change, exercisesOf } from '../../domain/progress'
import { changeHolders } from '../../domain/timeline'
import type { SetLog, Target, WorkoutExercise, WorkoutSection } from '../../domain/types'

const spelledOut = (sets: SetLog[], target: Target) => sets.map((set) => formatSet(set, target)).join(LIST_SEPARATOR)

function SetList({ exercise }: { exercise: WorkoutExercise }) {
  const parts = exerciseResult(exercise, spelledOut).split(LIST_SEPARATOR)

  return (
    <p className="workout-exercise-sets">
      {parts.map((part, index) => {
        const isLast = index === parts.length - 1

        return (
          <Fragment key={index}>
            <span className="workout-set">
              {part}
              {!isLast && <span className="workout-set-separator">{` ${LIST_MARK}`}</span>}
            </span>
            {!isLast && ' '}
          </Fragment>
        )
      })}
    </p>
  )
}

function ExerciseRow({ exercise, change }: { exercise: WorkoutExercise; change: Change | undefined }) {
  return (
    <IonItem className="workout-exercise-item">
      <IonLabel className="ion-text-wrap workout-exercise">
        <div className="workout-exercise-heading">
          <h3 className="workout-exercise-name">{exercise.name}</h3>
          {change && <ChangeBadge kind={change.kind} label={formatChange(change)} />}
        </div>
        <SetList exercise={exercise} />
      </IonLabel>
    </IonItem>
  )
}

export function WorkoutSections({ sections, changes }: { sections: WorkoutSection[]; changes: Change[] }) {
  const holders = changeHolders(exercisesOf({ sections }), changes)

  return sections.map((section, index) => (
    <section key={index} className="workout-part">
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
