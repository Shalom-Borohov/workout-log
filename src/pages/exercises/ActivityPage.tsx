import { IonPage } from '@ionic/react'
import { useParams } from 'react-router-dom'
import { ActivityDetail } from './ActivityDetail'

export function ActivityPage() {
  const { name } = useParams()

  return <IonPage>{name && <ActivityDetail name={decodeURIComponent(name)} />}</IonPage>
}
