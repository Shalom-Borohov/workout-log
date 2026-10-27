import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react'
import { barbell, listOutline, timeOutline } from 'ionicons/icons'
import { Navigate, Route } from 'react-router-dom'
import { ExerciseHistoryPage } from './pages/exercises/ExerciseHistoryPage'
import { ExercisesPage } from './pages/exercises/ExercisesPage'
import { ImportNotePage } from './pages/routines/ImportNotePage'
import { RoutineEditPage } from './pages/routines/RoutineEditPage'
import { RoutinesPage } from './pages/routines/RoutinesPage'
import { SettingsPage } from './pages/routines/SettingsPage'
import { TimelinePage } from './pages/timeline/TimelinePage'
import { WorkoutDetailPage } from './pages/timeline/WorkoutDetailPage'

export function Tabs() {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="timeline/:id" element={<WorkoutDetailPage />} />
        <Route path="routines" element={<RoutinesPage />} />
        <Route path="routines/import" element={<ImportNotePage />} />
        <Route path="routines/settings" element={<SettingsPage />} />
        <Route path="routines/:id" element={<RoutineEditPage />} />
        <Route path="exercises" element={<ExercisesPage />} />
        <Route path="exercises/:name" element={<ExerciseHistoryPage />} />
        <Route index element={<Navigate to="timeline" replace />} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="timeline" href="/tabs/timeline">
          <IonIcon icon={timeOutline} />
          <IonLabel>ציר זמן</IonLabel>
        </IonTabButton>
        <IonTabButton tab="routines" href="/tabs/routines">
          <IonIcon icon={listOutline} />
          <IonLabel>אימונים</IonLabel>
        </IonTabButton>
        <IonTabButton tab="exercises" href="/tabs/exercises">
          <IonIcon icon={barbell} />
          <IonLabel>תרגילים</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  )
}
