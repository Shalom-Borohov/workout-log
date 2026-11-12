export const BODY_AREAS = [
  'shoulders',
  'chest',
  'back',
  'arms',
  'core',
  'glutes',
  'legs',
  'fullBody',
  'cardio',
  'stretching',
] as const

export type BodyArea = (typeof BODY_AREAS)[number]

export const AREA_CHOICES = [...BODY_AREAS, null] as const

const NO_AREA_KEY = 'none'

export const isBodyArea = (value: unknown): value is BodyArea => BODY_AREAS.some((area) => area === value)

export const areaKey = (area: BodyArea | null) => (area === null ? NO_AREA_KEY : area)

export interface AreaGroup {
  area: BodyArea | null
  names: string[]
}

export function areaOf(areas: ReadonlyMap<string, BodyArea>, name: string): BodyArea | null {
  const area = areas.get(name)

  return area === undefined ? null : area
}

export function groupByArea(names: string[], areas: ReadonlyMap<string, BodyArea>): AreaGroup[] {
  const groups = AREA_CHOICES.map((area) => ({
    area,
    names: names.filter((name) => areaOf(areas, name) === area),
  }))

  return groups.filter((group) => group.names.length > 0)
}
