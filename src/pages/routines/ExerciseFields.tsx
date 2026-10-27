import { IonInput, IonItem, IonLabel, IonList, IonSegment, IonSegmentButton, type SegmentValue } from '@ionic/react'
import { useState } from 'react'
import { durationUnit } from '../../domain/format'
import { targetAmount } from '../../domain/progress'
import type { Change } from '../../domain/routineEdit'
import type { RoutineExercise, Target } from '../../domain/types'

interface Props {
  exercise: RoutineExercise
  onChange: (change: Change<RoutineExercise>) => void
}

const UNITS = [
  { value: 'reps', label: 'חזרות' },
  { value: 'minutes', label: 'דקות' },
  { value: 'seconds', label: 'שניות' },
] as const

type Unit = (typeof UNITS)[number]['value']

function isUnit(value: SegmentValue | undefined): value is Unit {
  return UNITS.some((u) => u.value === value)
}

function unitOf(target: Target): Unit {
  return target.kind === 'reps' ? 'reps' : durationUnit(target)
}

function shownAmount(target: Target, unit: Unit): number {
  return unit === 'minutes' ? targetAmount(target) / 60 : targetAmount(target)
}

function toTarget(amount: number, unit: Unit): Target {
  if (unit === 'reps') {
    return { kind: 'reps', reps: amount }
  }

  return { kind: 'duration', seconds: unit === 'minutes' ? amount * 60 : amount }
}

function parseAmount(value: string | null | undefined): number | null {
  const amount = Number(value)

  return value && Number.isInteger(amount) && amount >= 0 ? amount : null
}

export function ExerciseFields({ exercise, onChange }: Props) {
  const [unit, setUnit] = useState(() => unitOf(exercise.target))

  function changeUnit(next: SegmentValue | undefined) {
    if (!isUnit(next)) {
      return
    }
    onChange((e) => ({ ...e, target: toTarget(shownAmount(e.target, unit), next) }))
    setUnit(next)
  }

  function changeAmount(value: string | null | undefined) {
    const amount = parseAmount(value)

    if (amount !== null) {
      onChange((e) => ({ ...e, target: toTarget(amount, unit) }))
    }
  }

  function rename(name: string) {
    onChange((e) => ({ ...e, name }))
  }

  return (
    <IonList inset>
      <IonItem>
        <IonInput
          label="שם התרגיל"
          labelPlacement="stacked"
          placeholder="שם התרגיל"
          value={exercise.name}
          onIonChange={(e) => typeof e.detail.value === 'string' && rename(e.detail.value)}
        />
      </IonItem>
      <IonItem>
        <IonSegment value={unit} onIonChange={(e) => changeUnit(e.detail.value)}>
          {UNITS.map((u) => (
            <IonSegmentButton key={u.value} value={u.value}>
              <IonLabel>{u.label}</IonLabel>
            </IonSegmentButton>
          ))}
        </IonSegment>
      </IonItem>
      <IonItem>
        <IonInput
          label={UNITS.find((u) => u.value === unit)?.label}
          type="number"
          inputmode="numeric"
          className="amount-input"
          value={shownAmount(exercise.target, unit)}
          onIonChange={(e) => changeAmount(e.detail.value)}
        />
      </IonItem>
    </IonList>
  )
}
