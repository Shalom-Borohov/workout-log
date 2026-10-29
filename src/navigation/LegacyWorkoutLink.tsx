import { Navigate, useParams } from 'react-router-dom'
import { TIMELINE_PATH, workoutPath } from './paths'

export function LegacyWorkoutLink() {
  const { id } = useParams()

  return id && <Navigate to={workoutPath(TIMELINE_PATH, id)} replace />
}
