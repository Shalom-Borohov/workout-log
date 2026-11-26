import { clampTarget, clampWeight } from './limits'
import { namedOrDefault, routineExercise } from './routineEdit'
import { SECONDS_PER_MINUTE } from './time'
import type { RoutineExercise, Target } from './types'

const APOSTROPHES = `׳'’`
const MINUTE_UNIT = String.raw`דקות|דקה|דק[${APOSTROPHES}]?`
const SECOND_UNIT = String.raw`שניות|שנייה|שניה|שנ[${APOSTROPHES}]?`
const REPS_UNIT = 'חזרות|חזרה'
const WEIGHT_UNIT = 'ק[״"”“]ג|קג|קילו|[kK][gG]'
const SETS_TIMES = 'xX×*'
const SETS_WORD = 'סטים|סט'
const SETS_MARK = String.raw`(?:[${SETS_TIMES}]|(?:${SETS_WORD})(?:\s*[${SETS_TIMES}])?)`
const SEPARATOR = String.raw`(?:[:~×*\-–—]|(?<=\s)[xX])`
const RANGE_WORD = 'עד'
const AND_PREFIX = String.raw`ו\s*-?\s*`

const CLOCK_TIME = String.raw`(?<clockMinutes>\d+):(?<clockSeconds>[0-5]\d)`
const WORDS_TIME = String.raw`(?<wordMinutes>\d+)\s*(?:${MINUTE_UNIT})\s*(?:${AND_PREFIX})?(?<wordSeconds>\d+)(?:\s*(?:${SECOND_UNIT}))?`

const AMOUNT = new RegExp(
  String.raw`^(?<name>.*?)(?:\s*${SEPARATOR})?\s*(?:(?<sets>\d+)\s*${SETS_MARK}\s*)?(?:${CLOCK_TIME}|${WORDS_TIME}|(?<amount>\d+(?:\.\d+)?))\s*(?<unit>${MINUTE_UNIT}|${SECOND_UNIT}|${REPS_UNIT})?$`,
)

const NUMBER_TAIL = new RegExp(
  String.raw`(?:^|\s*:\s*|\s+(?:${SEPARATOR}\s*)?)(?:\d+\s*(?:${SETS_WORD})\s*)?\d(?:[\d\s:.,\-–—/${SETS_TIMES}]|${RANGE_WORD})*$`,
)

const WEIGHTS = new RegExp(String.raw`(?:^|\s*,\s*|\s+)(?<weight>\d[\d.,\-–—]*)\s*(?:${WEIGHT_UNIT})(?=[\s,]|$)`, 'g')
const SETS_END = new RegExp(String.raw`(?:^|\s*,\s*|\s*[${SETS_TIMES}]\s*|\s+)(?<endSets>\d+)\s*(?:${SETS_WORD})$`)
const PLAIN_WEIGHT = /^\d+(?:\.\d+)?$/
const TRAILING_SEPARATOR = new RegExp(String.raw`\s*${SEPARATOR}$`)
const LEADING_SETS = new RegExp(String.raw`^\s*(?:${SEPARATOR}\s*)?(\d+)\s*${SETS_MARK}`)
const MINUTES = /^דק/
const SECONDS = /^שנ/
const MAX_SECONDS_IN_MINUTE = 59
const UNREAD_AMOUNT = 0

type TargetKind = Target['kind']

type AmountGroups = {
  clockMinutes?: string
  clockSeconds?: string
  wordMinutes?: string
  wordSeconds?: string
  amount?: string
  unit?: string
}

export type ParsedExercise = { exercise: RoutineExercise; sets: number | null }

const minutesAndSeconds = (minutes: string, seconds: string): Target =>
  clampTarget({ kind: 'duration', seconds: Number(minutes) * SECONDS_PER_MINUTE + Number(seconds) })

function kindOf({ wordSeconds, unit }: AmountGroups): TargetKind {
  const timed = wordSeconds !== undefined || (unit !== undefined && (MINUTES.test(unit) || SECONDS.test(unit)))

  return timed ? 'duration' : 'reps'
}

function targetOf({ clockMinutes, clockSeconds, wordMinutes, wordSeconds, amount, unit }: AmountGroups): Target | null {
  if (clockMinutes !== undefined && clockSeconds !== undefined) {
    return minutesAndSeconds(clockMinutes, clockSeconds)
  }

  if (wordMinutes !== undefined && wordSeconds !== undefined) {
    const secondsReadable = Number(wordSeconds) <= MAX_SECONDS_IN_MINUTE && (unit === undefined || SECONDS.test(unit))

    return secondsReadable ? minutesAndSeconds(wordMinutes, wordSeconds) : null
  }

  const parsedAmount = Number(amount)
  const inMinutes = unit !== undefined && MINUTES.test(unit)

  if (!Number.isInteger(parsedAmount) && !inMinutes) {
    return null
  }

  if (unit === undefined || !(inMinutes || SECONDS.test(unit))) {
    return clampTarget({ kind: 'reps', reps: parsedAmount })
  }

  return clampTarget({ kind: 'duration', seconds: inMinutes ? Math.round(parsedAmount * SECONDS_PER_MINUTE) : parsedAmount })
}

const unreadTarget = (kind: TargetKind): Target =>
  kind === 'reps' ? { kind: 'reps', reps: UNREAD_AMOUNT } : { kind: 'duration', seconds: UNREAD_AMOUNT }

function unclearExercise(name: string, kind: TargetKind): ParsedExercise {
  const statedSets = name.match(NUMBER_TAIL)?.[0].match(LEADING_SETS)?.[1]

  return {
    exercise: routineExercise(namedOrDefault(name.replace(NUMBER_TAIL, '').replace(TRAILING_SEPARATOR, '')), unreadTarget(kind)),
    sets: statedSets === undefined ? null : Number(statedSets),
  }
}

type LineParts = { rest: string; sets: number | null; weight: number | null; weightWritten: boolean }

const readWeight = (text: string) => (PLAIN_WEIGHT.test(text) ? clampWeight(Number(text)) : null)

function splitParts(text: string): LineParts {
  const weights = [...text.matchAll(WEIGHTS)].map((match) => match.groups?.weight)
  const lastWeight = weights.at(-1)
  const withoutWeights = text.replace(WEIGHTS, '').trimEnd()
  const setsMatch = withoutWeights.match(SETS_END)
  const endSets = setsMatch?.groups?.endSets

  return {
    rest: setsMatch?.index === undefined ? withoutWeights : withoutWeights.slice(0, setsMatch.index),
    sets: endSets === undefined ? null : Number(endSets),
    weight: lastWeight === undefined ? null : readWeight(lastWeight),
    weightWritten: weights.length > 0,
  }
}

export function isExerciseLine(line: string): boolean {
  const parts = splitParts(line)

  return parts.weightWritten || parts.sets !== null || AMOUNT.test(parts.rest)
}

export function parseExercise(text: string): ParsedExercise {
  const parts = splitParts(text)
  const parsed = amountExercise(parts.rest)

  return {
    exercise: { ...parsed.exercise, weight: parsed.exercise.target.kind === 'reps' ? parts.weight : null },
    sets: parts.sets === null ? parsed.sets : parts.sets,
  }
}

function amountExercise(text: string): ParsedExercise {
  const groups = text.match(AMOUNT)?.groups

  if (!groups) {
    return unclearExercise(text, 'reps')
  }

  const target = NUMBER_TAIL.test(groups.name) ? null : targetOf(groups)

  if (target === null) {
    return unclearExercise(groups.name, kindOf(groups))
  }

  return {
    exercise: routineExercise(namedOrDefault(groups.name), target),
    sets: groups.sets === undefined ? null : Number(groups.sets),
  }
}
