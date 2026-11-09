import { afterEach, describe, expect, it } from 'vitest'
import { readStorageState } from '../../src/pages/settings/phoneState'
import { PHONE_STORAGE, PHONE_STORAGE_STATE, removeStorageStub, stubStorage } from '../helpers/storage'

describe('readStorageState', () => {
  afterEach(removeStorageStub)

  it('reads whether storage is persistent and how much is used', async () => {
    stubStorage(PHONE_STORAGE)

    await expect(readStorageState()).resolves.toEqual(PHONE_STORAGE_STATE)
  })

  it('knows neither where the browser has no storage manager', async () => {
    await expect(readStorageState()).resolves.toEqual({ persisted: null, usage: null })
  })

  it('still knows persistence on an iPhone too old to estimate usage', async () => {
    stubStorage({ persisted: () => Promise.resolve(false) })

    await expect(readStorageState()).resolves.toEqual({ persisted: false, usage: null })
  })

  it('still knows usage when the persistence check fails', async () => {
    stubStorage({ ...PHONE_STORAGE, persisted: () => Promise.reject(new TypeError('Failed')) })

    await expect(readStorageState()).resolves.toEqual({ persisted: null, usage: 2_400_000 })
  })

  it('knows no usage when the estimate leaves it out', async () => {
    stubStorage({ ...PHONE_STORAGE, estimate: () => Promise.resolve({}) })

    await expect(readStorageState()).resolves.toEqual({ persisted: true, usage: null })
  })
})
