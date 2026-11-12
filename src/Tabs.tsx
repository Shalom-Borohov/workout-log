import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react'
import { barbell, calendarOutline, listOutline, timeOutline } from 'ionicons/icons'
import { Navigate, Route, useLocation } from 'react-router-dom'
import { UpdateBar } from './appUpdate/UpdateBar'
import { useWhatsNew } from './appUpdate/useWhatsNew'
import { WhatsNewSheet } from './appUpdate/WhatsNewSheet'
import { COMMON_COPY } from './copy/common'
import { LegacyWorkoutLink } from './navigation/LegacyWorkoutLink'
import { DAILY_PATH, EXERCISES_PATH, isWorkoutPath, ROUTINES_PATH, TIMELINE_PATH } from './navigation/paths'
import { DailyArchivePage } from './pages/daily/DailyArchivePage'
import { DailyPage } from './pages/daily/DailyPage'
import { ActivityPage } from './pages/exercises/ActivityPage'
import { ExerciseHistoryPage } from './pages/exercises/ExerciseHistoryPage'
import { ExercisesPage } from './pages/exercises/ExercisesPage'
import { LiveWorkoutPage } from './pages/live/LiveWorkoutPage'
import { ImportNotePage } from './pages/routines/ImportNotePage'
import { RoutineEditPage } from './pages/routines/RoutineEditPage'
import { RoutinesPage } from './pages/routines/RoutinesPage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { TimelinePage } from './pages/timeline/TimelinePage'
import { WorkoutDetailPage } from './pages/timeline/WorkoutDetailPage'
import { RestClock } from './rest/restClock'

export function Tabs() {
  const inWorkout = isWorkoutPath(useLocation().pathname)
  const whatsNew = useWhatsNew(inWorkout)

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="timeline/:id" element={<WorkoutDetailPage tab={TIMELINE_PATH} />} />
        <Route path="timeline/workout/:id" element={<LiveWorkoutPage tab={TIMELINE_PATH} />} />
        <Route path="timeline/settings" element={<SettingsPage tab={TIMELINE_PATH} />} />
        <Route path="routines" element={<RoutinesPage />} />
        <Route path="routines/workout/:id" element={<LiveWorkoutPage tab={ROUTINES_PATH} />} />
        <Route path="routines/import" element={<ImportNotePage />} />
        <Route path="routines/settings" element={<SettingsPage tab={ROUTINES_PATH} />} />
        <Route path="routines/:id" element={<RoutineEditPage tab={ROUTINES_PATH} />} />
        <Route path="daily" element={<DailyPage />} />
        <Route path="daily/record/:id" element={<WorkoutDetailPage tab={DAILY_PATH} />} />
        <Route path="daily/workout/:id" element={<LiveWorkoutPage tab={DAILY_PATH} />} />
        <Route path="daily/archive" element={<DailyArchivePage />} />
        <Route path="daily/:id" element={<RoutineEditPage tab={DAILY_PATH} />} />
        <Route path="exercises" element={<ExercisesPage />} />
        <Route path="exercises/activity/:name" element={<ActivityPage />} />
        <Route path="exercises/:name" element={<ExerciseHistoryPage />} />
        <Route path="workout/:id" element={<LegacyWorkoutLink />} />
        <Route index element={<Navigate to="timeline" replace />} />
      </IonRouterOutlet>
      <UpdateBar inWorkout={inWorkout} />
      <IonTabBar slot="bottom" className={inWorkout ? 'ion-hide' : undefined}>
        <IonTabButton tab="timeline" href={TIMELINE_PATH}>
          <IonIcon icon={timeOutline} aria-hidden="true" />
          <IonLabel>{COMMON_COPY.timeline}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="daily" href={DAILY_PATH}>
          <IonIcon icon={calendarOutline} aria-hidden="true" />
          <IonLabel>{COMMON_COPY.daily}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="routines" href={ROUTINES_PATH}>
          <IonIcon icon={listOutline} aria-hidden="true" />
          <IonLabel>{COMMON_COPY.routines}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="exercises" href={EXERCISES_PATH}>
          <IonIcon icon={barbell} aria-hidden="true" />
          <IonLabel>{COMMON_COPY.exercises}</IonLabel>
        </IonTabButton>
      </IonTabBar>
      <WhatsNewSheet isOpen={whatsNew.isOpen} releases={whatsNew.releases} onClose={whatsNew.close} />
      <RestClock />
    </IonTabs>
  )
}
