import { removeDailyLog, toggleDailyLog } from '../../data/repo'
import { isEditedLog, newDailyLog } from '../../domain/daily'
import type { DailyLog, Routine } from '../../domain/types'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { useSave } from '../../hooks/useSave'
import { DAILY_COPY } from './copy'

export function useToggleDailyLog(routine: Routine) {
  const { save } = useSave()
  const confirmDelete = useConfirmDelete()

  return (date: string, log: DailyLog | undefined) => {
    if (log && isEditedLog(log, routine)) {
      confirmDelete({
        header: DAILY_COPY.removeLogQuestion,
        message: DAILY_COPY.removeLogMessage,
        onConfirm: () => void save(() => removeDailyLog(log.id)),
      })

      return
    }

    void save(() => toggleDailyLog(newDailyLog(routine, date)))
  }
}
