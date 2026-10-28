import { IonApp, IonRouterOutlet } from '@ionic/react'
import { IonReactHashRouter } from '@ionic/react-router'
import { Navigate, Route, useParams } from 'react-router-dom'
import { TIMELINE_PATH, workoutPath } from './navigation/paths'
import { Tabs } from './Tabs'

function LegacyWorkoutLink() {
  const { id } = useParams()

  return id && <Navigate to={workoutPath(id)} replace />
}

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
