import { finishedWorkouts } from '../../data/repo'
import { historyText } from '../../domain/exportText'
import { isoDate } from '../../domain/format'
import { shareFile } from './backupFile'

const HISTORY_TYPE = 'text/plain'

const historyFileName = (now: number) => `workouts-${isoDate(now)}.txt`

export async function shareHistory(now: number): Promise<void> {
  await shareFile(historyFileName(now), HISTORY_TYPE, historyText(await finishedWorkouts()))
}
