import { COMMON_COPY } from '../copy/common'
import { FORMAT_COPY } from '../copy/format'
import { countLabel, formatDate } from './format'
import type { WorkoutRecord } from './types'

export interface WorkoutSummary {
  count: number
  newestAt: number | null
}

export function summarizeWorkouts(records: WorkoutRecord[]): WorkoutSummary {
  const starts = records.filter((record) => record.finishedAt !== null).map((record) => record.startedAt)

  return { count: starts.length, newestAt: starts.length > 0 ? Math.max(...starts) : null }
}

function describe(summary: WorkoutSummary): string {
  if (summary.newestAt === null) {
    return COMMON_COPY.noWorkouts
  }

  return COMMON_COPY.newestWorkout(countLabel(summary.count, FORMAT_COPY.oneWorkout, FORMAT_COPY.workouts), formatDate(summary.newestAt))
}

export function restorePreviewLines(file: WorkoutSummary, phone: WorkoutSummary): string[] {
  return [COMMON_COPY.inFile(describe(file)), COMMON_COPY.onPhone(describe(phone)), COMMON_COPY.importReplacesAllData]
}
