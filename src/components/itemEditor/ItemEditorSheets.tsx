import type { Change, ItemInSection } from '../../domain/routineEdit'
import type { RoutineItem } from '../../domain/types'
import { ExercisePicker } from './ExercisePicker'
import { ItemEditModal } from './ItemEditModal'
import type { ItemSheetsFlow } from './useItemEditorFlow'

interface Props {
  flow: ItemSheetsFlow
  editing: ItemInSection | undefined
  showStartWeight?: boolean
  onChange: (id: string, change: Change<RoutineItem>) => void
  onDelete: (id: string) => void
}

export function ItemEditorSheets({ flow, editing, showStartWeight, onChange, onDelete }: Props) {
  return (
    <>
      <ItemEditModal
        editing={editing}
        showStartWeight={showStartWeight}
        onChange={onChange}
        onDelete={onDelete}
        onAddAfter={flow.addAfter}
        onClose={flow.sheetClosed}
      />
      <ExercisePicker isOpen={flow.picking} onPick={flow.pick} onClose={flow.cancelAdding} />
    </>
  )
}
