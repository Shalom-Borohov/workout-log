import { describe, expect, it } from 'vitest'
import { isBackupDue } from '../../src/domain/backupReminder'
import { daysSince } from '../../src/domain/time'
import { oct } from '../helpers/workouts'

describe('backup reminder', () => {
  it('is due once anything is logged when there was never a backup', () => {
    expect(isBackupDue({ backedUpAt: null, records: 0 }, 0, oct(26))).toBe(false)
    expect(isBackupDue({ backedUpAt: null, records: 0 }, 1, oct(26))).toBe(true)
  })

  it('is due a week after the last backup when something was logged since', () => {
    const status = { backedUpAt: oct(5, 10), records: 4 }

    expect(isBackupDue(status, 5, oct(12, 9, 59))).toBe(false)
    expect(isBackupDue(status, 5, oct(12, 10))).toBe(true)
  })

  it('is not due when nothing was logged since the last backup or dismissal', () => {
    expect(isBackupDue({ backedUpAt: oct(1), records: 4 }, 4, oct(26))).toBe(false)
    expect(isBackupDue({ backedUpAt: null, records: 3 }, 3, oct(26))).toBe(false)
  })

  it('counts whole days since a time', () => {
    expect(daysSince(oct(5, 12), oct(14, 11))).toBe(8)
    expect(daysSince(oct(5, 12), oct(14, 12))).toBe(9)
  })
})
