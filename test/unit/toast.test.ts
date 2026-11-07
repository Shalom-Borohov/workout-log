import { describe, expect, it } from 'vitest'
import { errorMessage } from '../../src/components/toast'
import { AppError } from '../../src/domain/appError'

describe('errorMessage', () => {
  it('shows the text of an error the app wrote itself', () => {
    expect(errorMessage(new AppError('קובץ הגיבוי לא תקין'))).toBe('קובץ הגיבוי לא תקין')
  })

  it.each([
    ['a plain error', new Error('The source image could not be decoded.')],
    ['a browser exception', new DOMException('The request is not allowed', 'NotAllowedError')],
    ['something that is not an error', 'boom'],
  ])('shows the generic text for %s', (_case, error) => {
    expect(errorMessage(error)).toBe('הפעולה נכשלה')
  })
})
