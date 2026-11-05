import { useState } from 'react'
import { newItem } from '../../domain/routineEdit'
import type { RoutineExercise, RoutineItem } from '../../domain/types'

export type AddTarget<Section> = { section: Section } | { after: string }

export interface ItemSheetsFlow {
  picking: boolean
  addAfter: (id: string) => void
  sheetClosed: () => void
  pick: (exercise?: RoutineExercise) => void
  cancelAdding: () => void
}

export interface ItemEditorFlow<Section> extends ItemSheetsFlow {
  editingId: string | null
  open: (id: string) => void
  close: () => void
  addTo: (section: Section) => void
}

export function useItemEditorFlow<Section>(
  insert: (target: AddTarget<Section>, item: RoutineItem) => void,
): ItemEditorFlow<Section> {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState<AddTarget<Section> | null>(null)
  const [addingOnceClosed, setAddingOnceClosed] = useState<AddTarget<Section> | null>(null)

  function pick(exercise?: RoutineExercise) {
    if (adding === null) {
      return
    }
    const id = crypto.randomUUID()

    insert(adding, exercise ? newItem(id, [exercise]) : newItem(id))
    setAdding(null)

    if (!exercise) {
      setEditingId(id)
    }
  }

  function addAfter(id: string) {
    if (editingId === null) {
      setAdding({ after: id })

      return
    }
    setEditingId(null)
    setAddingOnceClosed({ after: id })
  }

  function sheetClosed() {
    setEditingId(null)

    if (addingOnceClosed !== null) {
      setAdding(addingOnceClosed)
      setAddingOnceClosed(null)
    }
  }

  return {
    editingId,
    open: setEditingId,
    close: () => setEditingId(null),
    picking: adding !== null,
    addTo: (section) => setAdding({ section }),
    addAfter,
    sheetClosed,
    pick,
    cancelAdding: () => setAdding(null),
  }
}
