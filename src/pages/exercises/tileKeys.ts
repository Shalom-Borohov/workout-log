import type { areaKey } from '../../domain/bodyAreas'

export const ACTIVITIES_TILE = 'activities' as const

export type TileKey = ReturnType<typeof areaKey> | typeof ACTIVITIES_TILE
