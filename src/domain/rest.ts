export const REST_STEP_SECONDS = 15

export const MIN_REST_SECONDS = REST_STEP_SECONDS

export function stepRest(seconds: number, direction: 1 | -1): number {
  return Math.max(seconds + direction * REST_STEP_SECONDS, MIN_REST_SECONDS)
}
