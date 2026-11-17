import {
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonTextarea,
  type SegmentValue,
} from '@ionic/react'
import { swapHorizontal } from 'ionicons/icons'
import { useState } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { carryExerciseArea, claimExerciseArea, setExerciseArea } from '../../data/exerciseAreas'
import { useExerciseAreas } from '../../data/hooks'
import { areaOf, type BodyArea } from '../../domain/bodyAreas'
import { BodyAreaPicker } from '../bodyArea/BodyAreaPicker'
import { commitName } from '../commitName'
import { ITEM_EDITOR_COPY } from './copy'
import { clampTarget, maxAmount } from '../../domain/limits'
import { weightPatch } from '../../domain/numberInput'
import { targetAmount, withTargetAmount } from '../../domain/progress'
import { type Change, DEFAULT_EXERCISE_NAME } from '../../domain/routineEdit'
import { SECONDS_PER_MINUTE } from '../../domain/time'
import type { RoutineExercise, Target } from '../../domain/types'
import { type AmountUnit, stepValue, targetUnit, unitStep } from '../../domain/workoutEdits'
import { useSave } from '../../hooks/useSave'
import { StepperButtons } from '../Stepper'
import './itemEditor.css'

interface Props {
  exercise: RoutineExercise
  showStartWeight: boolean
  onChange: (change: Change<RoutineExercise>) => void
  onReplace: () => void
}

const UNIT_LABELS: Record<AmountUnit, string> = {
  reps: COMMON_COPY.reps,
  minutes: ITEM_EDITOR_COPY.minutes,
  seconds: COMMON_COPY.seconds,
}

function isUnit(unit: SegmentValue | undefined): unit is AmountUnit {
  return typeof unit === 'string' && Object.hasOwn(UNIT_LABELS, unit)
}

function shownAmount(target: Target, unit: AmountUnit): number {
  return unit === 'minutes' ? targetAmount(target) / SECONDS_PER_MINUTE : targetAmount(target)
}

function toTarget(amount: number, unit: AmountUnit): Target {
  if (unit === 'reps') {
    return clampTarget({ kind: 'reps', reps: amount })
  }

  return clampTarget({ kind: 'duration', seconds: unit === 'minutes' ? amount * SECONDS_PER_MINUTE : amount })
}

function parseAmount(text: string | null | undefined): number | null {
  const amount = Number(text)

  return text && Number.isInteger(amount) && amount >= 0 ? amount : null
}

export function ExerciseFields({ exercise, showStartWeight, onChange, onReplace }: Props) {
  const [unit, setUnit] = useState(() => targetUnit(exercise.target))
  const unitLabel = UNIT_LABELS[unit]
  const step = unitStep(unit)
  const currentAmount = targetAmount(exercise.target)
  const nameSuffix = ITEM_EDITOR_COPY.nameSuffix(exercise.name)
  const areas = useExerciseAreas()
  const [unnamedArea, setUnnamedArea] = useState<BodyArea | null>(null)
  const isUnnamed = exercise.name === DEFAULT_EXERCISE_NAME
  const { save } = useSave()

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

  function stepAmount(direction: 1 | -1) {
    onChange((current) => {
      const stepped = stepValue(targetAmount(current.target), direction * step, maxAmount(current.target))

      return { ...current, target: withTargetAmount(current.target, Math.max(stepped, step)) }
    })
  }

  function changeWeight(text: string | null | undefined) {
    const { weight } = text ? weightPatch(text) : { weight: null }

    if (weight !== undefined) {
      onChange((current) => ({ ...current, weight }))
    }
  }

  function pickArea(picked: BodyArea | null) {
    if (isUnnamed) {
      setUnnamedArea(picked)

      return
    }
    void save(() => setExerciseArea(exercise.name, picked))
  }

  function rename(name: string) {
    if (isUnnamed && unnamedArea !== null) {
      void save(() => claimExerciseArea(name, unnamedArea))
    }
    if (!isUnnamed && name !== DEFAULT_EXERCISE_NAME) {
      void save(() => carryExerciseArea(exercise.name, name))
    }
    setUnnamedArea(null)
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
          onIonChange={(event) => commitName(event, exercise.name, rename)}
        />
      </IonItem>
      <IonItem button detail={false} onClick={onReplace}>
        <IonIcon slot="start" color="primary" icon={swapHorizontal} aria-hidden="true" />
        <IonLabel color="primary">
          {ITEM_EDITOR_COPY.replaceExercise}
          <span className="visually-hidden">{nameSuffix}</span>
        </IonLabel>
      </IonItem>
      <IonItem>
        <IonSegment value={unit} onIonChange={(event) => changeUnit(event.detail.value)}>
          {Object.entries(UNIT_LABELS).map(([option, label]) => (
            <IonSegmentButton key={option} value={option}>
              <IonLabel>{label}</IonLabel>
            </IonSegmentButton>
          ))}
        </IonSegment>
      </IonItem>
      <IonItem>
        <IonInput
          label={unitLabel}
          type="number"
          inputmode="numeric"
          className="amount-input"
          value={shownAmount(exercise.target, unit)}
          onIonChange={(event) => changeAmount(event.detail.value)}
        />
        <div slot="end">
          <StepperButtons
            canDecrease={currentAmount > step}
            canIncrease={currentAmount < maxAmount(exercise.target)}
            decreaseLabel={COMMON_COPY.decrease(unitLabel) + nameSuffix}
            increaseLabel={COMMON_COPY.increase(unitLabel) + nameSuffix}
            onDecrease={() => stepAmount(-1)}
            onIncrease={() => stepAmount(1)}
          />
        </div>
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
      {areas && (
        <IonItem>
          <BodyAreaPicker value={isUnnamed ? unnamedArea : areaOf(areas, exercise.name)} onChange={pickArea} />
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
