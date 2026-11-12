import { IonFooter, IonIcon, useIonRouter } from '@ionic/react'
import { chevronBack } from 'ionicons/icons'
import type { ReactNode } from 'react'
import { findDailyLog } from '../../domain/daily'
import { isoDate } from '../../domain/format'
import type { DailyLog, Routine } from '../../domain/types'
import { DAILY_ARCHIVE_PATH } from '../../navigation/paths'
import { DAILY_COPY } from './copy'
import { RoutineTile } from './RoutineTile'
import './routineTiles.css'

const TILES_PER_PAGE = 4

const pagesOf = (cells: ReactNode[]) =>
  Array.from({ length: Math.ceil(cells.length / TILES_PER_PAGE) }, (_, page) =>
    cells.slice(page * TILES_PER_PAGE, (page + 1) * TILES_PER_PAGE),
  )

interface RoutineTilesProps {
  routines: Routine[]
  logs: DailyLog[]
  now: number
}

export function RoutineTiles({ routines, logs, now }: RoutineTilesProps) {
  const router = useIonRouter()
  const daily = routines.filter((routine) => routine.daily)
  const today = isoDate(now)

  const tiles = daily
    .filter((routine) => !routine.archived)
    .map((routine) => <RoutineTile key={routine.id} routine={routine} log={findDailyLog(logs, routine.id, today)} />)

  const archiveLink = (
    <button
      key="archive"
      type="button"
      className="plain-button routine-tiles-archive"
      onClick={() => router.push(DAILY_ARCHIVE_PATH)}
    >
      {DAILY_COPY.archived}
      <IonIcon icon={chevronBack} aria-hidden="true" />
    </button>
  )

  const cells = daily.some((routine) => routine.archived) ? [...tiles, archiveLink] : tiles

  if (cells.length === 0) {
    return null
  }

  return (
    <IonFooter className="routine-tiles-footer">
      <div className="routine-tiles">
        {pagesOf(cells).map((page, index) => (
          <div key={index} className="routine-tiles-page">
            {page}
          </div>
        ))}
      </div>
    </IonFooter>
  )
}
