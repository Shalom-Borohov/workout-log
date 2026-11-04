import { describe, expect, it } from 'vitest'
import { makeDaily, nextDrillColor } from '../../src/domain/drillColors'
import type { DrillColor } from '../../src/domain/types'
import { dailyRoutine, routine } from '../helpers/workouts'

const drill = (id: string, color: DrillColor) => dailyRoutine(id, id, [], { color })

describe('nextDrillColor', () => {
  it('starts with red and takes the first unused colour', () => {
    expect(nextDrillColor([])).toBe('red')
    expect(nextDrillColor([drill('a', 'red'), drill('b', 'yellow')])).toBe('orange')
  })

  it('ignores the colours of gym routines', () => {
    expect(nextDrillColor([{ ...routine('g', 'g', []), color: 'red' }])).toBe('red')
  })

  it('repeats the least used colour once all eight are taken', () => {
    const palette: DrillColor[] = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink']
    const taken = [...palette.map((color) => drill(color, color)), drill('second-red', 'red')]

    expect(nextDrillColor(taken)).toBe('orange')
  })
})

describe('makeDaily', () => {
  it('gives a routine that becomes daily the next colour', () => {
    const made = makeDaily(routine('r1', 'בוקר', []), true, [drill('a', 'red')])

    expect(made).toMatchObject({ daily: true, color: 'orange', archived: false })
  })

  it('keeps a colour the routine already has', () => {
    expect(makeDaily({ ...routine('r1', 'בוקר', []), color: 'blue' }, true, [drill('a', 'red')]).color).toBe('blue')
  })

  it('takes a routine out of the archive when it stops being daily', () => {
    const archived = { ...drill('r1', 'blue'), archived: true }

    expect(makeDaily(archived, false, [])).toMatchObject({ daily: false, color: 'blue', archived: false })
  })
})
