import Dexie from 'dexie'
import { describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'

const v2Routine = {
  id: 'r1',
  name: 'אימון גוף מלא',
  updatedAt: 5,
  sections: [
    {
      id: 's1',
      name: 'עיקרי',
      sets: 3,
      items: [
        {
          id: 'i1',
          exercises: [
            { name: 'משיכה לפנים', target: { kind: 'reps', reps: 12 } },
            { name: 'פלאנק', target: { kind: 'duration', seconds: 30 } },
          ],
        },
      ],
    },
  ],
}

const v2Workout = {
  id: 'w1',
  routineId: 'r1',
  routineName: 'אימון גוף מלא',
  startedAt: 1000,
  finishedAt: 2000,
  summary: 'הרגשתי חזק',
  sections: [
    {
      name: 'עיקרי',
      items: [
        {
          id: 'i1',
          exercises: [
            {
              name: 'משיכה לפנים',
              target: { kind: 'reps', reps: 12 },
              sets: [
                { weight: 40, amount: 12, done: true },
                { weight: null, amount: 10, done: false },
              ],
              skipped: false,
            },
          ],
        },
      ],
    },
  ],
}

describe('database upgrade to v3', () => {
  it('keeps every v2 record and fills the new fields with empty defaults', async () => {
    const legacyDb = new Dexie('workout-log')
    legacyDb.version(2).stores({ routines: 'id, name', workouts: 'id, startedAt, finishedAt' })
    await legacyDb.table('routines').put(v2Routine)
    await legacyDb.table('workouts').put(v2Workout)
    legacyDb.close()

    expect(await db.routines.toArray()).toEqual([
      {
        id: 'r1',
        name: 'אימון גוף מלא',
        updatedAt: 5,
        sections: [
          {
            id: 's1',
            name: 'עיקרי',
            sets: 3,
            items: [
              {
                id: 'i1',
                sets: null,
                exercises: [
                  { name: 'משיכה לפנים', target: { kind: 'reps', reps: 12 }, weight: null, tip: '' },
                  { name: 'פלאנק', target: { kind: 'duration', seconds: 30 }, weight: null, tip: '' },
                ],
              },
            ],
          },
        ],
      },
    ])
    expect(await db.workouts.toArray()).toEqual([
      {
        id: 'w1',
        routineId: 'r1',
        routineName: 'אימון גוף מלא',
        startedAt: 1000,
        finishedAt: 2000,
        summary: 'הרגשתי חזק',
        sections: [
          {
            name: 'עיקרי',
            items: [
              {
                id: 'i1',
                exercises: [
                  {
                    name: 'משיכה לפנים',
                    target: { kind: 'reps', reps: 12 },
                    sets: [
                      { weight: 40, amount: 12, done: true },
                      { weight: null, amount: 10, done: false },
                    ],
                    skipped: false,
                    tip: '',
                    note: '',
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
    expect(await db.settings.count()).toBe(0)
  })
})
