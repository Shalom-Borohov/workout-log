const LONGEST_FITTED_CHARS = 6

export function numeralChars(text: string): number {
  return Math.min(text.length, LONGEST_FITTED_CHARS)
}
