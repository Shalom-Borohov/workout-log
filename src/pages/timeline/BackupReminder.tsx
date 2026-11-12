import { IonButton, IonIcon, IonItem, IonLabel } from '@ionic/react'
import { close } from 'ionicons/icons'
import { COMMON_COPY } from '../../copy/common'
import { dismissBackupReminder } from '../../data/backupStatus'
import { useBackupStatus } from '../../data/hooks'
import { isBackupDue } from '../../domain/backupReminder'
import { daysSince } from '../../domain/time'
import { useBackUp } from '../../hooks/useBackUp'
import { useSave } from '../../hooks/useSave'
import { TIMELINE_COPY } from './copy'

export function BackupReminder({ records, now }: { records: number | undefined; now: number }) {
  const status = useBackupStatus()
  const backUp = useBackUp()
  const { save } = useSave()

  if (!status || records === undefined || !isBackupDue(status, records, now)) {
    return null
  }

  return (
    <div className="tile-quiet backup-reminder">
      <IonItem lines="none">
        <IonButton
          slot="start"
          fill="clear"
          color="medium"
          aria-label={COMMON_COPY.close}
          onClick={() => void save(dismissBackupReminder)}
        >
          <IonIcon slot="icon-only" icon={close} aria-hidden="true" />
        </IonButton>
        <IonLabel>
          {status.backedUpAt === null
            ? TIMELINE_COPY.neverBackedUp
            : TIMELINE_COPY.lastBackup(daysSince(status.backedUpAt, now))}
        </IonLabel>
        <IonButton slot="end" size="small" shape="round" onClick={() => void backUp()}>
          {COMMON_COPY.backup}
        </IonButton>
      </IonItem>
    </div>
  )
}
