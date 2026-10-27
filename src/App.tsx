import { IonApp, IonRouterOutlet } from '@ionic/react'
import { IonReactHashRouter } from '@ionic/react-router'
import { Navigate, Route } from 'react-router-dom'
import { Tabs } from './Tabs'
import { LiveWorkoutPage } from './pages/live/LiveWorkoutPage'

export function AppRoutes() {
  return (
    <IonRouterOutlet>
      <Route path="/tabs/*" element={<Tabs />} />
      <Route path="/workout/:id" element={<LiveWorkoutPage />} />
      <Route path="/" element={<Navigate to="/tabs/timeline" replace />} />
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
