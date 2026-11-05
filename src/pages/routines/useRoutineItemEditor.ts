import { useItemEditorFlow } from '../../components/itemEditor/useItemEditorFlow'
import { addItemAfter, type Change, findItem, removeItem, updateItem, updateSection } from '../../domain/routineEdit'
import type { Routine, RoutineItem } from '../../domain/types'

export function useRoutineItemEditor(routine: Routine, edit: (change: Change<Routine>) => void) {
  const flow = useItemEditorFlow<string>((target, item) =>
    edit((current) =>
      'after' in target
        ? addItemAfter(current, target.after, item)
        : updateSection(current, target.section, (section) => ({ ...section, items: [...section.items, item] })),
    ),
  )

  function remove(id: string) {
    flow.close()
    edit((current) => removeItem(current, id))
  }

  return {
    flow,
    editing: flow.editingId === null ? undefined : findItem(routine, flow.editingId),
    change: (id: string, change: Change<RoutineItem>) => edit((current) => updateItem(current, id, change)),
    remove,
  }
}
