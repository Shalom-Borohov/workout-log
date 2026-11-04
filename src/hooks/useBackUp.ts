import { shareBackup } from '../components/backupFile'
import { exportBackup } from '../data/backup'
import { markBackedUp } from '../data/backupStatus'
import { useShare } from './useShare'

export function useBackUp() {
  const share = useShare()

  return () =>
    share(async () => {
      const now = Date.now()

      await shareBackup(await exportBackup(now))
      await markBackedUp(now)
    })
}
