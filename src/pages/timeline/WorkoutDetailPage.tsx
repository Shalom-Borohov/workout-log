import { IonPage } from '@ionic/react'
import { useParams } from 'react-router-dom'
import type { DetailHostPath } from '../../navigation/paths'
import { WorkoutDetail } from './WorkoutDetail'

export function WorkoutDetailPage({ tab }: { tab: DetailHostPath }) {
  const { id } = useParams()

  return <IonPage>{id && <WorkoutDetail id={id} tab={tab} />}</IonPage>
}
