import { useEffect, useState } from 'react'
import { readStorageState, UNKNOWN_STORAGE } from './phoneState'

export function usePhoneStorage() {
  const [storage, setStorage] = useState(UNKNOWN_STORAGE)

  useEffect(() => {
    void readStorageState().then(setStorage)
  }, [])

  return storage
}
