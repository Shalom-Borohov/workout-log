import { useIonRouter } from '@ionic/react'

export function BackGesture() {
  const router = useIonRouter()

  return (
    <button type="button" data-testid="swipe-back" onClick={() => router.goBack()}>
      back
    </button>
  )
}
