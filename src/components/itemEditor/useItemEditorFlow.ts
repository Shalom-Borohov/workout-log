import { useState } from 'react'
import { type Change, namedOrDefault, newExercise, newItem, replaceExercise } from '../../domain/routineEdit'
import type { RoutineExercise, RoutineItem } from '../../domain/types'

export type AddTarget<Section> = { section: Section } | { after: string }

type PickerRequest<Section> =
  | { mode: 'add'; target: AddTarget<Section> }
  | { mode: 'replace'; id: string; exerciseIndex: number }

export type PickerMode = 'add' | 'replace'

export interface ItemSheetsFlow {
  picking: boolean
  pickerMode: PickerMode
  addAfter: (id: string) => void
  replace: (id: string, exerciseIndex: number) => void
  sheetClosed: () => void
  addPicked: (exercises: RoutineExercise[]) => void
  create: (ticked: RoutineExercise[], name: string) => void
  replaceWith: (exercise: RoutineExercise) => void
  pickerClosed: () => void
}

export interface ItemEditorFlow<Section> extends ItemSheetsFlow {
  editingId: string | null
  open: (id: string) => void
  close: () => void
  addTo: (section: Section) => void
}

export function useItemEditorFlow<Section>(
  insert: (target: AddTarget<Section>, items: RoutineItem[]) => void,
  change: (id: string, change: Change<RoutineItem>) => void,
): ItemEditorFlow<Section> {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [request, setRequest] = useState<PickerRequest<Section> | null>(null)
  const [picking, setPicking] = useState(false)
  const [requestOnceClosed, setRequestOnceClosed] = useState<PickerRequest<Section> | null>(null)

  function showPicker(next: PickerRequest<Section>) {
    setRequest(next)
    setPicking(true)
  }

  function requestFromSheet(next: PickerRequest<Section>) {
    if (editingId === null) {
      showPicker(next)

      return
    }
    setEditingId(null)
    setRequestOnceClosed(next)
  }

  function add(exercises: RoutineExercise[], editLast: boolean) {
    if (!picking || request?.mode !== 'add') {
      return
    }
    const items = exercises.map((exercise) => newItem(crypto.randomUUID(), [exercise]))
    const last = items.at(-1)

    insert(request.target, items)
    setPicking(false)

    if (editLast && last) {
      setEditingId(last.id)
    }
  }

  function replaceWith(exercise: RoutineExercise) {
    if (!picking || request?.mode !== 'replace') {
      return
    }
    const { exerciseIndex } = request

    change(request.id, (item) => replaceExercise(item, exerciseIndex, exercise))
    setPicking(false)
  }

  function sheetClosed() {
    setEditingId(null)

    if (requestOnceClosed !== null) {
      showPicker(requestOnceClosed)
      setRequestOnceClosed(null)
    }
  }

  function pickerClosed() {
    setPicking(false)

    if (request?.mode === 'replace') {
      setEditingId(request.id)
    }
    setRequest(null)
  }

  return {
    editingId,
    open: setEditingId,
    close: () => setEditingId(null),
    picking,
    pickerMode: request === null ? 'add' : request.mode,
    addTo: (section) => showPicker({ mode: 'add', target: { section } }),
    addAfter: (id) => requestFromSheet({ mode: 'add', target: { after: id } }),
    replace: (id, exerciseIndex) => requestFromSheet({ mode: 'replace', id, exerciseIndex }),
    sheetClosed,
    addPicked: (exercises) => add(exercises, false),
    create: (ticked, name) => add([...ticked, newExercise(namedOrDefault(name))], true),
    replaceWith,
    pickerClosed,
  }
}
