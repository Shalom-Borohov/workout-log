import { describe, expect, it } from 'vitest'
import { feedbackUrl, fitsInLink } from '../../src/pages/settings/feedbackUrl'

describe('fitsInLink', () => {
  it('accepts a link of exactly 4,300 characters', () => {
    expect(fitsInLink('a'.repeat(4300))).toBe(true)
  })

  it('rejects a link of 4,301 characters', () => {
    expect(fitsInLink('a'.repeat(4301))).toBe(false)
  })

  it('fits a Hebrew report of about 400 letters', () => {
    expect(fitsInLink(feedbackUrl('bug', 'א'.repeat(400)))).toBe(true)
  })

  it('does not fit a Hebrew report of about 1,000 letters', () => {
    expect(fitsInLink(feedbackUrl('bug', 'א'.repeat(1000)))).toBe(false)
  })
})
