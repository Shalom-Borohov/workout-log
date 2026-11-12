import { IonItem, IonLabel, IonList } from '@ionic/react'
import type { LatestActivity } from '../../domain/activities'
import { formatDay } from '../../domain/format'
import { activityPath } from '../../navigation/paths'
import { ActivityIcon } from './ActivityIcon'

function ActivityRow({ entry, withIcon }: { entry: LatestActivity; withIcon: boolean }) {
  return (
    <IonItem button detail={false} className="exercise-row" routerLink={activityPath(entry.name)}>
      {withIcon && <ActivityIcon slot="start" />}
      <IonLabel className="ion-text-wrap">
        <h2>{entry.name}</h2>
        <p>{formatDay(entry.last.startedAt)}</p>
      </IonLabel>
    </IonItem>
  )
}

export function ActivityList({ entries, withIcons }: { entries: LatestActivity[]; withIcons: boolean }) {
  return (
    <IonList inset>
      {entries.map((entry) => (
        <ActivityRow key={entry.name} entry={entry} withIcon={withIcons} />
      ))}
    </IonList>
  )
}
