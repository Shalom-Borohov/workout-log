import { describe, expect, it } from 'vitest'
import { restorePreviewLines, summarizeWorkouts } from '../../src/domain/restorePreview'
import { activity, oct, workout } from '../helpers/workouts'

describe('restore preview', () => {
  it('counts finished workouts and activities and finds the newest by its start', () => {
    const records = [
      workout({ id: 'w1', startedAt: oct(20), exercises: [] }),
      activity({ id: 'a1', startedAt: oct(24, 19), summary: '', location: '' }),
      workout({ id: 'w2', startedAt: oct(22), finishedAt: oct(30), exercises: [] }),
      workout({ id: 'live', startedAt: oct(26), finishedAt: null, exercises: [] }),
    ]

    expect(summarizeWorkouts(records)).toEqual({ count: 3, newestAt: oct(24, 19) })
  })

  it('compares the file with the phone, then warns', () => {
    const lines = restorePreviewLines({ count: 42, newestAt: oct(29) }, { count: 1, newestAt: new Date(2026, 10, 5).getTime() })

    expect(lines).toEqual(['בקובץ: 42 אימונים, האחרון 29.10.2026', 'במכשיר: אימון אחד, האחרון 5.11.2026', 'הייבוא יחליף את כל הנתונים במכשיר.'])
  })

  it('says when a side has no workouts', () => {
    expect(restorePreviewLines({ count: 0, newestAt: null }, { count: 0, newestAt: null }).slice(0, 2)).toEqual(['בקובץ: אין אימונים', 'במכשיר: אין אימונים'])
  })
})
