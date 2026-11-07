import { IonItem } from '@ionic/react'
import type { ReactNode } from 'react'
import './ButtonRow.css'

interface ButtonRowProps {
  label: string
  detail?: boolean
  onClick: () => void
  children: ReactNode
  controls: ReactNode
}

export function ButtonRow({ label, detail = false, onClick, children, controls }: ButtonRowProps) {
  return (
    <IonItem className="ion-activatable" detail={detail} onClick={onClick}>
      {children}
      <button type="button" className="plain-button row-button" aria-label={label} />
      {controls}
    </IonItem>
  )
}
