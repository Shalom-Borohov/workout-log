import type { WorkoutItem } from '../../domain/types'
import type { Cell, SetSelection } from './useSetSelection'

export interface SetRowsProps {
  item: WorkoutItem
  selection: SetSelection
}

export interface SetSlidingActions {
  canRemove: boolean
  onDuplicate: () => void
  onRemove: () => void
}

export function slidingActions({ item, selection }: SetRowsProps, { exercise, set }: Cell): SetSlidingActions {
  return {
    canRemove: item.exercises[exercise].sets.length > 1,
    onDuplicate: () => selection.duplicate(exercise, set),
    onRemove: () => selection.remove(exercise, set),
  }
}
