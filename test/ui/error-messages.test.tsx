import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDb } from '../helpers/db'
import { toasts } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { mockShare } from '../helpers/share'

const browserRefusal = () => Object.assign(new Error('The request is not allowed'), { name: 'NotAllowedError' })

describe('error messages in settings', () => {
  beforeEach(resetDb)

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('says in Hebrew that a chosen file cannot be opened as a photo', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockRejectedValue(new DOMException('The source image could not be decoded.', 'InvalidStateError')),
    )
    renderAt('/tabs/routines/settings')
    await screen.findByText('תמונת רקע')

    fireEvent.change(screen.getByLabelText('קובץ תמונת רקע'), {
      target: { files: [new File(['not a photo'], 'notes.txt', { type: 'text/plain' })] },
    })

    await waitFor(() => expect(toasts()).toEqual(['אי אפשר לפתוח את הקובץ הזה כתמונה']))
  })

  it.each(['ייצוא גיבוי', 'ייצוא היסטוריה'])('%s that the browser refuses shows the generic Hebrew text', async (action) => {
    mockShare().mockRejectedValue(browserRefusal())
    renderAt('/tabs/routines/settings')

    fireEvent.click(await screen.findByText(action))

    await waitFor(() => expect(toasts()).toEqual(['הפעולה נכשלה']))
  })
})
