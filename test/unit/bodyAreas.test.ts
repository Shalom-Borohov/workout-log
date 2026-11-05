import { describe, expect, it } from 'vitest'
import { groupByArea } from '../../src/domain/bodyAreas'

describe('groupByArea', () => {
  it('groups from the shoulders down, keeps each group in the given order and puts untagged exercises last', () => {
    const names = ['גשר ישבן', 'הכנסת סנטר', 'חתירה', 'לחיצת חזה', 'משיכה אנכית', 'סקוואט']

    const areas = new Map([
      ['סקוואט', 'legs'],
      ['חתירה', 'back'],
      ['לחיצת חזה', 'chest'],
      ['משיכה אנכית', 'back'],
      ['גשר ישבן', 'glutes'],
    ] as const)

    expect(groupByArea(names, areas)).toEqual([
      { area: 'chest', names: ['לחיצת חזה'] },
      { area: 'back', names: ['חתירה', 'משיכה אנכית'] },
      { area: 'glutes', names: ['גשר ישבן'] },
      { area: 'legs', names: ['סקוואט'] },
      { area: null, names: ['הכנסת סנטר'] },
    ])
  })

  it('orders every area as shoulders, chest, back, arms, core, glutes, legs, full body, cardio, stretching', () => {
    const names = ['מתיחה', 'קרדיו', 'גוף', 'רגל', 'ישבן', 'בטן', 'יד', 'גב', 'חזה', 'כתף']

    const areas = new Map([
      ['מתיחה', 'stretching'],
      ['קרדיו', 'cardio'],
      ['גוף', 'fullBody'],
      ['רגל', 'legs'],
      ['ישבן', 'glutes'],
      ['בטן', 'core'],
      ['יד', 'arms'],
      ['גב', 'back'],
      ['חזה', 'chest'],
      ['כתף', 'shoulders'],
    ] as const)

    expect(groupByArea(names, areas).map((group) => group.names[0])).toEqual([
      'כתף',
      'חזה',
      'גב',
      'יד',
      'בטן',
      'ישבן',
      'רגל',
      'גוף',
      'קרדיו',
      'מתיחה',
    ])
  })

  it('has no groups without exercises', () => {
    expect(groupByArea([], new Map())).toEqual([])
  })
})
