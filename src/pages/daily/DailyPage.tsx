import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonList,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react'
import { add } from 'ionicons/icons'
import { useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { COMMON_COPY } from '../../copy/common'
import { useDailyLogs, useRoutines } from '../../data/hooks'
import { saveRoutine } from '../../data/repo'
import { dailyLogId, loggedDates, monthStart, shiftMonth } from '../../domain/daily'
import { isoDate } from '../../domain/format'
import { newRoutine } from '../../domain/routineEdit'
import { MINUTE_MS } from '../../domain/time'
import { useNow } from '../../hooks/useNow'
import { DAILY_PATH, routinePath } from '../../navigation/paths'
import { DAILY_COPY } from './copy'
import { MonthCalendar } from './MonthCalendar'
import { TodayCard } from './TodayCard'
import './daily.css'

export function DailyPage() {
  const daily = useRoutines()?.filter((routine) => routine.daily)
  const logs = useDailyLogs()
  const router = useIonRouter()
  const now = useNow(MINUTE_MS)
  const today = isoDate(now)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [monthsBack, setMonthsBack] = useState(0)
  const selected = daily?.find((routine) => routine.id === selectedId) ?? daily?.at(0)
  const month = shiftMonth(monthStart(now), -monthsBack)

  async function addDaily() {
    const id = crypto.randomUUID()

    await saveRoutine(newRoutine(id, crypto.randomUUID(), Date.now(), true))
    router.push(routinePath(DAILY_PATH, id))
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>{COMMON_COPY.daily}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => void addDaily()} aria-label={DAILY_COPY.addDaily}>
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{COMMON_COPY.daily}</IonTitle>
          </IonToolbar>
        </IonHeader>
        {daily?.length === 0 && <EmptyState title={DAILY_COPY.emptyTitle} body={DAILY_COPY.emptyBody} />}
        {daily && logs && daily.length > 0 && (
          <IonList inset>
            {daily.map((routine) => (
              <TodayCard key={routine.id} routine={routine} done={logs.some((log) => log.id === dailyLogId(routine.id, today))} />
            ))}
          </IonList>
        )}
        {daily && daily.length > 1 && selected && (
          <IonSegment
            className="daily-picker"
            scrollable
            value={selected.id}
            onIonChange={(event) => typeof event.detail.value === 'string' && setSelectedId(event.detail.value)}
          >
            {daily.map((routine) => (
              <IonSegmentButton key={routine.id} value={routine.id}>
                <IonLabel>{routine.name}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        )}
        {selected && logs && (
          <MonthCalendar
            routineId={selected.id}
            logged={loggedDates(logs, selected.id)}
            month={month}
            now={now}
            onMonthsBack={(change) => setMonthsBack((current) => current + change)}
          />
        )}
      </IonContent>
    </IonPage>
  )
}
