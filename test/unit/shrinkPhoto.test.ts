import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../../src/domain/appError'
import { shrinkPhoto } from '../../src/pages/settings/shrinkPhoto'

const photo = new Blob(['photo'], { type: 'image/jpeg' })

describe('shrinkPhoto', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('says in Hebrew that a file it cannot decode cannot be opened as a photo', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockRejectedValue(new DOMException('The source image could not be decoded.', 'InvalidStateError')),
    )

    const failure = shrinkPhoto(photo)

    await expect(failure).rejects.toBeInstanceOf(AppError)
    await expect(failure).rejects.toThrow('אי אפשר לפתוח את הקובץ הזה כתמונה')
  })

  it('says in Hebrew that the device cannot process the photo when it has no canvas to draw on', async () => {
    class CanvasWithoutContext {
      width = 0
      height = 0
      getContext = () => null
    }

    vi.stubGlobal('OffscreenCanvas', CanvasWithoutContext)
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 4000, height: 3000, close: vi.fn() }))

    const failure = shrinkPhoto(photo)

    await expect(failure).rejects.toBeInstanceOf(AppError)
    await expect(failure).rejects.toThrow('אי אפשר לעבד את התמונה במכשיר הזה')
  })
})
