import Dexie from 'dexie'
import { beforeEach, describe, expect, it } from 'vitest'
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

const v3Routine = {
  id: 'r2',
  name: 'אימון רגליים',
  updatedAt: 7,
  sections: [
    {
      id: 's1',
      name: 'עיקרי',
      sets: 3,
      items: [{ id: 'i1', sets: 4, exercises: [{ name: 'סקוואט', target: { kind: 'reps', reps: 12 }, weight: 40, tip: 'גב ישר' }] }],
    },
  ],
}

const v3Workout = {
  id: 'w2',
  routineId: 'r2',
  routineName: 'אימון רגליים',
  startedAt: 3000,
  finishedAt: 4000,
  summary: '',
  sections: [
    {
      name: 'עיקרי',
      items: [
        {
          id: 'i1',
          exercises: [
            {
              name: 'סקוואט',
              target: { kind: 'reps', reps: 12 },
              sets: [{ weight: 40, amount: 12, done: true }],
              skipped: false,
              tip: 'גב ישר',
              note: 'לעלות ל-45',
            },
          ],
        },
      ],
    },
  ],
}

describe('database upgrade', () => {
  beforeEach(() => db.delete({ disableAutoOpen: false }))

  it('keeps every v2 record and fills the new fields with defaults', async () => {
    const legacyDb = new Dexie('workout-log')
    legacyDb.version(2).stores({ routines: 'id, name', workouts: 'id, startedAt, finishedAt' })
    await legacyDb.table('routines').put(v2Routine)
    await legacyDb.table('workouts').put(v2Workout)
    legacyDb.close()

    expect(await db.routines.toArray()).toEqual([
      {
        id: 'r1',
        name: 'אימון גוף מלא',
        createdAt: 5,
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

  it('keeps every v3 record and dates each routine from its last edit', async () => {
    const legacyDb = new Dexie('workout-log')
    legacyDb.version(3).stores({ routines: 'id, name', workouts: 'id, startedAt, finishedAt', settings: 'key' })
    await legacyDb.table('routines').put(v3Routine)
    await legacyDb.table('workouts').put(v3Workout)
    legacyDb.close()

    expect(await db.routines.toArray()).toEqual([{ ...v3Routine, createdAt: 7 }])
    expect(await db.workouts.toArray()).toEqual([v3Workout])
  })
})
