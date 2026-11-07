import { afterEach, describe, expect, it, vi } from 'vitest'
import { errorMessage } from '../../src/components/toast'
import { AppError } from '../../src/domain/appError'
import { feedbackUrl } from '../../src/pages/settings/feedbackUrl'
import { freezeDate } from '../helpers/clock'

const reportBody = () => new URL(feedbackUrl('bug', 'דיווח')).searchParams.get('body')

describe('the last error in a report', () => {
  freezeDate(new Date(2026, 10, 7, 0, 30).getTime())

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('names the type and date of an unexpected error', () => {
    errorMessage(new TypeError('Failed to fetch'))

    expect(reportBody()).toContain('\nשגיאה אחרונה: TypeError (2026-11-07)')
  })

  it('never includes the text of the error, which could quote a stored record', () => {
    errorMessage(new Error('Key already exists: סקוואט 60 ק״ג'))

    expect(reportBody()).not.toContain('סקוואט')
  })

  it('keeps only the latest one', () => {
    errorMessage(new TypeError('first'))
    errorMessage(new RangeError('second'))

    expect(reportBody()).toContain('שגיאה אחרונה: RangeError')
    expect(reportBody()).not.toContain('TypeError')
  })

  it('adds no line when nothing failed', () => {
    expect(reportBody()).not.toContain('שגיאה אחרונה')
  })

  it('adds no line for a message the app wrote itself', () => {
    errorMessage(new AppError('קובץ הגיבוי לא תקין'))

    expect(reportBody()).not.toContain('שגיאה אחרונה')
  })

  it('still gives the message when the phone cannot store the error', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    expect(errorMessage(new TypeError('Failed to fetch'))).toBe('הפעולה נכשלה')
  })
})
