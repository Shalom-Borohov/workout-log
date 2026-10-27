import { IonButton, IonButtons, IonHeader, IonIcon, IonNote, IonProgressBar, IonTitle, IonToolbar } from '@ionic/react'
import { ellipsisHorizontal } from 'ionicons/icons'
import { ElapsedClock } from '../../components/ElapsedClock'

interface LiveHeaderProps {
  title: string
  startedAt: number | null
  progress: { done: number; total: number }
  onMenu: () => void
  onFinish: () => void
}

export function LiveHeader({ title, startedAt, progress, onMenu, onFinish }: LiveHeaderProps) {
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton aria-label="פעולות לתרגיל" onClick={onMenu}>
            <IonIcon slot="icon-only" icon={ellipsisHorizontal} />
          </IonButton>
        </IonButtons>
        <IonTitle>
          <div className="live-title">{title}</div>
          {startedAt !== null && (
            <IonNote className="live-clock">
              <ElapsedClock startedAt={startedAt} />
            </IonNote>
          )}
        </IonTitle>
        <IonButtons slot="end">
          <IonButton strong onClick={onFinish}>
            סיום
          </IonButton>
        </IonButtons>
      </IonToolbar>
      <IonProgressBar
        className="live-progress"
        aria-label="התקדמות האימון"
        value={progress.total === 0 ? 0 : progress.done / progress.total}
      />
    </IonHeader>
  )
}
