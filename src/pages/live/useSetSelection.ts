import { useState } from 'react'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { LIVE_COPY } from './copy'
import type { SetLog, WorkoutItem } from '../../domain/types'
import { setCount } from '../../domain/workoutStructure'

export type Cell = { exercise: number; set: number }

type Selected = { itemId: string; cell: Cell }

interface SetHandlers {
  onChange: (exercise: number, set: number, patch: Partial<SetLog>) => void
  onDuplicate: (exercise: number, set: number) => void
  onRemove: (exercise: number, set: number) => void
}

function cells(item: WorkoutItem): Cell[] {
  return Array.from({ length: setCount(item) }, (_, set) =>
    item.exercises.flatMap((workoutExercise, exercise) =>
      set < workoutExercise.sets.length ? [{ exercise, set }] : [],
    ),
  ).flat()
}

function firstUndone(item: WorkoutItem): Cell | undefined {
  return cells(item).find((cell) => !item.exercises[cell.exercise].sets[cell.set].done)
}

function stillThere(item: WorkoutItem, { exercise, set }: Cell): boolean {
  return exercise < item.exercises.length && set < item.exercises[exercise].sets.length
}

export function useSetSelection(item: WorkoutItem, { onChange, onDuplicate, onRemove }: SetHandlers) {
  const [selected, setSelected] = useState<Selected | null>(null)
  const confirmDelete = useConfirmDelete()

  if (selected !== null && selected.itemId !== item.id) {
    setSelected(null)
  }

  function removeNow(exercise: number, set: number) {
    setSelected(null)
    onRemove(exercise, set)
  }

  return {
    current: selected !== null && stillThere(item, selected.cell) ? selected.cell : firstUndone(item),
    select: (cell: Cell) => setSelected({ itemId: item.id, cell }),
    change: (exercise: number, set: number, patch: Partial<SetLog>) => {
      if (patch.done === true) {
        setSelected(null)
      }
      onChange(exercise, set, patch)
    },
    duplicate: (exercise: number, set: number) => {
      setSelected(null)
      onDuplicate(exercise, set)
    },
    remove: (exercise: number, set: number) => {
      if (!item.exercises[exercise].sets[set].done) {
        removeNow(exercise, set)

        return
      }
      confirmDelete({
        header: LIVE_COPY.removeSetQuestion,
        message: LIVE_COPY.removeSetMessage,
        onConfirm: () => removeNow(exercise, set),
      })
    },
  }
}

export type SetSelection = ReturnType<typeof useSetSelection>
