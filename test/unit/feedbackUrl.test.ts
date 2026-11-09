import { afterEach, describe, expect, it, vi } from 'vitest'
import { recordLastError } from '../../src/data/lastError'
import { feedbackUrl, fitsInLink } from '../../src/pages/settings/feedbackUrl'
import { UNKNOWN_STORAGE } from '../../src/pages/settings/phoneState'
import { PHONE_STORAGE_STATE as KNOWN_STORAGE } from '../helpers/storage'

function deviceLines(url: string): string[] {
  const body = new URL(url).searchParams.get('body')

  if (body === null) {
    throw new Error('no body')
  }

  return body.split('### מכשיר\n')[1].split('\n')
}

describe('fitsInLink', () => {
  it('accepts a link of exactly 4,300 characters', () => {
    expect(fitsInLink('a'.repeat(4300))).toBe(true)
  })

  it('rejects a link of 4,301 characters', () => {
    expect(fitsInLink('a'.repeat(4301))).toBe(false)
  })

  it('fits a Hebrew report of about 400 letters', () => {
    expect(fitsInLink(feedbackUrl('bug', 'א'.repeat(400), UNKNOWN_STORAGE))).toBe(true)
  })

  it('does not fit a Hebrew report of about 1,000 letters', () => {
    expect(fitsInLink(feedbackUrl('bug', 'א'.repeat(1000), KNOWN_STORAGE))).toBe(false)
  })
})

describe('the device details of a report', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    Reflect.deleteProperty(navigator, 'standalone')
  })

  it('say whether it is the Home Screen app, online, with persistent storage, and how much is stored', () => {
    Object.defineProperty(navigator, 'standalone', { configurable: true, value: true })
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

    expect(deviceLines(feedbackUrl('bug', 'דיווח', KNOWN_STORAGE)).slice(2)).toEqual([
      'אפליקציה ממסך הבית: כן',
      'מחובר לרשת: לא',
      'אחסון קבוע: כן',
      'אחסון בשימוש: 2.4 MB',
    ])
  })

  it('say no for a browser tab that is online without persistent storage', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

    expect(deviceLines(feedbackUrl('bug', 'דיווח', { persisted: false, usage: 0 })).slice(2)).toEqual([
      'אפליקציה ממסך הבית: לא',
      'מחובר לרשת: כן',
      'אחסון קבוע: לא',
      'אחסון בשימוש: 0.0 MB',
    ])
  })

  it('end with the last error, after the phone state', () => {
    recordLastError(new TypeError('Failed'))

    expect(deviceLines(feedbackUrl('bug', 'דיווח', KNOWN_STORAGE)).slice(5)).toEqual([
      'אחסון בשימוש: 2.4 MB',
      expect.stringMatching(/^שגיאה אחרונה: TypeError \(/),
    ])
  })
})
