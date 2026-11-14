import { useEffect, useState } from 'react'
import { backUpStoredData, type BackUpResult } from '../components/backupFile'
import { COMMON_COPY } from '../copy/common'
import { RECOVERY_COPY } from './copy'
import { RecoveryImport } from './RecoveryImport'
import { checkForUpdateOnOpen, reloadIntoLatest } from './serviceWorkerUpdate'
import './recovery.css'

export function RecoveryScreen() {
  const [result, setResult] = useState<BackUpResult>({ failure: null, dateNotSaved: false, badRecords: 0 })

  useEffect(checkForUpdateOnOpen, [])

  return (
    <main className="recovery">
      <h1>{RECOVERY_COPY.title}</h1>
      <p>{RECOVERY_COPY.explanation}</p>
      <button type="button" className="recovery-primary" onClick={() => void backUpStoredData().then(setResult)}>
        {COMMON_COPY.exportBackup}
      </button>
      <div role="status">
        {result.failure && <p>{COMMON_COPY.actionFailed}</p>}
        {result.dateNotSaved && <p>{COMMON_COPY.saveFailed}</p>}
        {result.badRecords > 0 && <p>{COMMON_COPY.badRecordsInBackup(result.badRecords)}</p>}
      </div>
      <RecoveryImport />
      <button type="button" onClick={reloadIntoLatest}>
        {RECOVERY_COPY.reload}
      </button>
    </main>
  )
}
