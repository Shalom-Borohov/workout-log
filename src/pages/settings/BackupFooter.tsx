import { IonNote } from '@ionic/react'
import { useBackupStatus } from '../../data/hooks'
import { formatDateTime } from '../../domain/format'
import { SETTINGS_COPY } from './copy'

export function BackupFooter() {
  const backedUpAt = useBackupStatus()?.backedUpAt

  return (
    <IonNote className="list-footer">
      {SETTINGS_COPY.backupFooter}
      {backedUpAt !== undefined && (
        <span className="list-footer-line">
          {backedUpAt === null ? SETTINGS_COPY.noBackupYet : SETTINGS_COPY.lastBackup(formatDateTime(backedUpAt))}
        </span>
      )}
    </IonNote>
  )
}
