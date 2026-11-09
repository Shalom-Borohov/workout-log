import { readLastError } from '../../data/lastError'

export type StorageState = { persisted: boolean | null; usage: number | null }

export type DeviceDetails = StorageState & {
  userAgent: string
  version: string
  buildTime: string
  homeScreenApp: boolean
  online: boolean
  lastError: string | null
}

export const UNKNOWN_STORAGE: StorageState = { persisted: null, usage: null }

const isHomeScreenApp = () => 'standalone' in navigator && navigator.standalone === true

export const readDeviceDetails = (storage: StorageState): DeviceDetails => ({
  ...storage,
  userAgent: navigator.userAgent,
  version: __APP_VERSION__,
  buildTime: __BUILD_TIME__,
  homeScreenApp: isHomeScreenApp(),
  online: navigator.onLine,
  lastError: readLastError(),
})

async function nullOnFailure<T>(read: () => Promise<T>): Promise<T | null> {
  try {
    return await read()
  } catch {
    return null
  }
}

export async function readStorageState(): Promise<StorageState> {
  const [persisted, estimate] = await Promise.all([
    nullOnFailure(() => navigator.storage.persisted()),
    nullOnFailure(() => navigator.storage.estimate()),
  ])

  return { persisted, usage: estimate?.usage ?? null }
}
