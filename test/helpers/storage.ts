export const PHONE_STORAGE_STATE = { persisted: true, usage: 2_400_000 }

export const PHONE_STORAGE: Partial<StorageManager> = {
  persisted: () => Promise.resolve(PHONE_STORAGE_STATE.persisted),
  estimate: () => Promise.resolve({ usage: PHONE_STORAGE_STATE.usage, quota: 10_000_000_000 }),
}

export function stubStorage(manager: Partial<StorageManager>) {
  Object.defineProperty(navigator, 'storage', { configurable: true, value: manager })
}

export const removeStorageStub = () => Reflect.deleteProperty(navigator, 'storage')
