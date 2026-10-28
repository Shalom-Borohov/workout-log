import {
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonTextarea,
  type SegmentValue,
} from '@ionic/react'
import { useState } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { ITEM_EDITOR_COPY } from './copy'
import { durationUnit } from '../../domain/format'
import { clampAmount } from '../../domain/limits'
import { weightPatch } from '../../domain/numberInput'
import { targetAmount } from '../../domain/progress'
import type { Change } from '../../domain/routineEdit'
import { SECONDS_PER_MINUTE } from '../../domain/time'
import type { RoutineExercise, Target } from '../../domain/types'
import './itemEditor.css'

interface Props {
  exercise: RoutineExercise
  showStartWeight: boolean
  onChange: (change: Change<RoutineExercise>) => void
}

const UNITS = [
  { value: 'reps', label: COMMON_COPY.reps },
  { value: 'minutes', label: ITEM_EDITOR_COPY.minutes },
  { value: 'seconds', label: ITEM_EDITOR_COPY.seconds },
] as const

type Unit = (typeof UNITS)[number]['value']

function isUnit(unit: SegmentValue | undefined): unit is Unit {
  return UNITS.some((option) => option.value === unit)
}

function unitOf(target: Target): Unit {
  return target.kind === 'reps' ? 'reps' : durationUnit(target)
}

function shownAmount(target: Target, unit: Unit): number {
  return unit === 'minutes' ? targetAmount(target) / SECONDS_PER_MINUTE : targetAmount(target)
}

function toTarget(amount: number, unit: Unit): Target {
  if (unit === 'reps') {
    return { kind: 'reps', reps: clampAmount(amount, { kind: 'reps', reps: amount }) }
  }
  const seconds = unit === 'minutes' ? amount * SECONDS_PER_MINUTE : amount

  return { kind: 'duration', seconds: clampAmount(seconds, { kind: 'duration', seconds }) }
}

function parseAmount(text: string | null | undefined): number | null {
  const amount = Number(text)

  return text && Number.isInteger(amount) && amount >= 0 ? amount : null
}

export function ExerciseFields({ exercise, showStartWeight, onChange }: Props) {
  const [unit, setUnit] = useState(() => unitOf(exercise.target))

  function changeUnit(next: SegmentValue | undefined) {
    if (!isUnit(next)) {
      return
    }
    onChange((current) => ({
      ...current,
      target: toTarget(shownAmount(current.target, unit), next),
      weight: next === 'reps' ? current.weight : null,
    }))
    setUnit(next)
  }

  function changeAmount(text: string | null | undefined) {
    const amount = parseAmount(text)

    if (amount !== null) {
      onChange((current) => ({ ...current, target: toTarget(amount, unit) }))
    }
  }

  function changeWeight(text: string | null | undefined) {
    const { weight } = text ? weightPatch(text) : { weight: null }

    if (weight !== undefined) {
      onChange((current) => ({ ...current, weight }))
    }
  }

  function rename(name: string) {
    onChange((current) => ({ ...current, name }))
  }

  function changeTip(tip: string) {
    onChange((current) => ({ ...current, tip }))
  }

  return (
    <IonList inset>
      <IonItem>
        <IonInput
          label={COMMON_COPY.exerciseName}
          labelPlacement="stacked"
          placeholder={COMMON_COPY.exerciseName}
          value={exercise.name}
          onIonChange={(event) => typeof event.detail.value === 'string' && rename(event.detail.value)}
        />
      </IonItem>
      <IonItem>
        <IonSegment value={unit} onIonChange={(event) => changeUnit(event.detail.value)}>
          {UNITS.map((option) => (
            <IonSegmentButton key={option.value} value={option.value}>
              <IonLabel>{option.label}</IonLabel>
            </IonSegmentButton>
          ))}
        </IonSegment>
      </IonItem>
      <IonItem>
        <IonInput
          label={UNITS.find((option) => option.value === unit)?.label}
          type="number"
          inputmode="numeric"
          className="amount-input"
          value={shownAmount(exercise.target, unit)}
          onIonChange={(event) => changeAmount(event.detail.value)}
        />
      </IonItem>
      {showStartWeight && unit === 'reps' && (
        <IonItem>
          <IonInput
            label={ITEM_EDITOR_COPY.startWeight}
            type="number"
            inputmode="decimal"
            className="amount-input"
            value={exercise.weight}
            onIonChange={(event) => changeWeight(event.detail.value)}
          />
        </IonItem>
      )}
      <IonItem>
        <IonTextarea
          label={ITEM_EDITOR_COPY.tips}
          labelPlacement="stacked"
          autoGrow
          value={exercise.tip}
          onIonChange={(event) => typeof event.detail.value === 'string' && changeTip(event.detail.value)}
        />
      </IonItem>
    </IonList>
  )
}
