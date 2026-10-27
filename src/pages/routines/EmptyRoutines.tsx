import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/react'
import { clipboardOutline, createOutline } from 'ionicons/icons'
import { EmptyState } from '../../components/EmptyState'

interface Props {
  onPaste: () => void
  onEmpty: () => void
}

export function EmptyRoutines({ onPaste, onEmpty }: Props) {
  return (
    <>
      <EmptyState
        title="אין עדיין אימונים"
        body="מדביקים את הפתק של האימון, והאפליקציה מפרקת אותו לחלקים ולתרגילים. או בונים אימון מאפס."
      />
      <IonList inset>
        <IonItem button detail onClick={onPaste}>
          <IonIcon slot="start" color="primary" className="option-icon" icon={clipboardOutline} />
          <IonLabel>
            <h2>הדבקת פתק</h2>
            <p>מהפתקים באייפון</p>
          </IonLabel>
        </IonItem>
        <IonItem button detail onClick={onEmpty}>
          <IonIcon slot="start" color="primary" className="option-icon" icon={createOutline} />
          <IonLabel>
            <h2>אימון ריק</h2>
            <p>מוסיפים חלקים ותרגילים בעצמכם</p>
          </IonLabel>
        </IonItem>
      </IonList>
    </>
  )
}
