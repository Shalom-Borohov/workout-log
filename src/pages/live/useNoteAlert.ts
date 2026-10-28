import { useIonAlert } from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { LIVE_COPY } from './copy'
import type { WorkoutItem } from '../../domain/types'

const field = (index: number) => `note${index}`

export function useNoteAlert(item: WorkoutItem, onSave: (notes: string[]) => void) {
  const [present] = useIonAlert()
  const pair = item.exercises.length > 1

  return () =>
    present({
      header: COMMON_COPY.nextTimeNote,
      inputs: item.exercises.map((exercise, exerciseIndex) => ({
        name: field(exerciseIndex),
        type: 'textarea' as const,
        value: exercise.note,
        placeholder: pair ? exercise.name : LIVE_COPY.notePlaceholder,
        attributes: { 'aria-label': LIVE_COPY.noteFor(exercise.name) },
      })),
      buttons: [
        { text: COMMON_COPY.cancel, role: 'cancel' },
        {
          text: COMMON_COPY.save,
          handler: (values: Record<string, string>) =>
            onSave(item.exercises.map((_, exerciseIndex) => values[field(exerciseIndex)].trim())),
        },
      ],
    })
}
