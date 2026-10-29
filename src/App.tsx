import { IonApp, IonRouterOutlet } from '@ionic/react'
import { IonReactHashRouter } from '@ionic/react-router'
import { Navigate, Route } from 'react-router-dom'
import { LegacyWorkoutLink } from './navigation/LegacyWorkoutLink'
import { TIMELINE_PATH } from './navigation/paths'
import { Tabs } from './Tabs'

export function AppRoutes() {
  return (
    <IonRouterOutlet>
      <Route path="/tabs/*" element={<Tabs />} />
      <Route path="/workout/:id" element={<LegacyWorkoutLink />} />
      <Route path="/" element={<Navigate to={TIMELINE_PATH} replace />} />
    </IonRouterOutlet>
  )
}

export function App() {
  return (
    <IonApp>
      <IonReactHashRouter>
        <AppRoutes />
      </IonReactHashRouter>
    </IonApp>
  )
}
