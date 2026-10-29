import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react'
import { barbell, listOutline, timeOutline } from 'ionicons/icons'
import { Navigate, Route, useLocation } from 'react-router-dom'
import { COMMON_COPY } from './copy/common'
import { LegacyWorkoutLink } from './navigation/LegacyWorkoutLink'
import { EXERCISES_PATH, isWorkoutPath, ROUTINES_PATH, TIMELINE_PATH } from './navigation/paths'
import { ExerciseHistoryPage } from './pages/exercises/ExerciseHistoryPage'
import { ExercisesPage } from './pages/exercises/ExercisesPage'
import { LiveWorkoutPage } from './pages/live/LiveWorkoutPage'
import { ImportNotePage } from './pages/routines/ImportNotePage'
import { RoutineEditPage } from './pages/routines/RoutineEditPage'
import { RoutinesPage } from './pages/routines/RoutinesPage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { TimelinePage } from './pages/timeline/TimelinePage'
import { WorkoutDetailPage } from './pages/timeline/WorkoutDetailPage'

export function Tabs() {
  const inWorkout = isWorkoutPath(useLocation().pathname)

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="timeline/:id" element={<WorkoutDetailPage />} />
        <Route path="timeline/workout/:id" element={<LiveWorkoutPage />} />
        <Route path="timeline/settings" element={<SettingsPage tab={TIMELINE_PATH} />} />
        <Route path="routines" element={<RoutinesPage />} />
        <Route path="routines/workout/:id" element={<LiveWorkoutPage />} />
        <Route path="routines/import" element={<ImportNotePage />} />
        <Route path="routines/settings" element={<SettingsPage tab={ROUTINES_PATH} />} />
        <Route path="routines/:id" element={<RoutineEditPage />} />
        <Route path="exercises" element={<ExercisesPage />} />
        <Route path="exercises/:name" element={<ExerciseHistoryPage />} />
        <Route path="workout/:id" element={<LegacyWorkoutLink />} />
        <Route index element={<Navigate to="timeline" replace />} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom" className={inWorkout ? 'ion-hide' : undefined}>
        <IonTabButton tab="timeline" href={TIMELINE_PATH}>
          <IonIcon icon={timeOutline} />
          <IonLabel>{COMMON_COPY.timeline}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="routines" href={ROUTINES_PATH}>
          <IonIcon icon={listOutline} />
          <IonLabel>{COMMON_COPY.routines}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="exercises" href={EXERCISES_PATH}>
          <IonIcon icon={barbell} />
          <IonLabel>{COMMON_COPY.exercises}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  )
}
