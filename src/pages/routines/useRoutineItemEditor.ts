import { useItemEditorFlow } from '../../components/itemEditor/useItemEditorFlow'
import { addItemsAfter, appendItems, type Change, findItem, removeItem, updateItem, updateSection } from '../../domain/routineEdit'
import type { Routine, RoutineItem } from '../../domain/types'

export function useRoutineItemEditor(routine: Routine, edit: (change: Change<Routine>) => void) {
  function change(id: string, itemChange: Change<RoutineItem>) {
    edit((current) => updateItem(current, id, itemChange))
  }

  const flow = useItemEditorFlow<string>(
    (target, items) =>
      edit((current) =>
        'after' in target
          ? addItemsAfter(current, target.after, items)
          : updateSection(current, target.section, (section) => appendItems(section, items)),
      ),
    change,
  )

  function remove(id: string) {
    flow.close()
    edit((current) => removeItem(current, id))
  }

  return {
    flow,
    editing: flow.editingId === null ? undefined : findItem(routine, flow.editingId),
    change,
    remove,
  }
}
