import { useState } from 'react'
import { backUpStoredData, type BackUpResult } from '../components/backupFile'
import { COMMON_COPY } from '../copy/common'
import { RECOVERY_COPY } from './copy'
import './recovery.css'

export function RecoveryScreen() {
  const [result, setResult] = useState<BackUpResult>({ failure: null, badRecords: 0 })

  return (
    <main className="recovery">
      <h1>{RECOVERY_COPY.title}</h1>
      <p>{RECOVERY_COPY.explanation}</p>
      <button type="button" className="recovery-primary" onClick={() => void backUpStoredData().then(setResult)}>
        {COMMON_COPY.exportBackup}
      </button>
      <div role="status">
        {result.failure && <p>{COMMON_COPY.actionFailed}</p>}
        {result.badRecords > 0 && <p>{COMMON_COPY.badRecordsInBackup(result.badRecords)}</p>}
      </div>
      <button type="button" onClick={() => window.location.reload()}>
        {RECOVERY_COPY.reload}
      </button>
    </main>
  )
}
