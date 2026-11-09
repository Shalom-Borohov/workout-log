import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { BACKUP_FILE_ACCEPT, readBackup } from '../components/backupFile'
import { errorMessage } from '../components/toast'
import { COMMON_COPY } from '../copy/common'
import type { Backup } from '../data/backup'
import { recordLastError } from '../data/lastError'
import { restoreBackup, restorePreview } from '../data/restore'
import { reloadAtStart } from './serviceWorkerUpdate'

interface PendingImport {
  backup: Backup
  lines: string[]
}

export function RecoveryImport() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<PendingImport | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)
  const cancelButton = useRef<HTMLButtonElement>(null)
  const importButton = useRef<HTMLButtonElement>(null)
  const wasConfirming = useRef(false)

  useEffect(() => {
    if (pending) {
      cancelButton.current?.focus()
    } else if (wasConfirming.current) {
      importButton.current?.focus()
    }

    wasConfirming.current = pending !== null
  }, [pending])

  async function previewFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]

    input.value = ''

    if (!file) {
      return
    }

    try {
      const backup = await readBackup(file)
      const lines = await restorePreview(backup)

      setMessage(null)
      setPending({ backup, lines })
    } catch (error) {
      setMessage(errorMessage(error))
    }
  }

  async function importBackup(backup: Backup) {
    setRestoring(true)

    try {
      await restoreBackup(backup, Date.now())
    } catch (error) {
      recordLastError(error)
      setMessage(COMMON_COPY.saveFailed)
      setRestoring(false)

      return
    }

    reloadAtStart()
  }

  function cancel() {
    setPending(null)
    setMessage(null)
  }

  return (
    <>
      {!pending && (
        <button ref={importButton} type="button" onClick={() => fileInput.current?.click()}>
          {COMMON_COPY.importBackup}
        </button>
      )}
      <div role="status">
        {pending?.lines.map((line) => <p key={line}>{line}</p>)}
        {message && <p>{message}</p>}
      </div>
      {pending && (
        <>
          <button
            type="button"
            className="recovery-primary"
            disabled={restoring}
            onClick={() => void importBackup(pending.backup)}
          >
            {COMMON_COPY.import}
          </button>
          <button ref={cancelButton} type="button" className="recovery-secondary" disabled={restoring} onClick={cancel}>
            {COMMON_COPY.cancel}
          </button>
        </>
      )}
      <input
        ref={fileInput}
        type="file"
        accept={BACKUP_FILE_ACCEPT}
        hidden
        aria-label={COMMON_COPY.backupFile}
        onChange={(event) => void previewFile(event)}
      />
    </>
  )
}
