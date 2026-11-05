import type { BodyArea } from '../domain/bodyAreas'

const AREA_NAMES: Record<BodyArea, string> = {
  shoulders: 'כתפיים',
  chest: 'חזה',
  back: 'גב',
  arms: 'ידיים',
  core: 'בטן',
  glutes: 'ישבן',
  legs: 'רגליים',
  fullBody: 'גוף מלא',
  cardio: 'קרדיו',
  stretching: 'מתיחות',
}

const NO_AREA = 'ללא'

export const BODY_AREA_COPY = {
  label: 'אזור בגוף',
  name: (area: BodyArea | null) => (area === null ? NO_AREA : AREA_NAMES[area]),
} as const
