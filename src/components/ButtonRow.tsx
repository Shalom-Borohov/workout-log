import { IonItem } from '@ionic/react'
import type { ReactNode } from 'react'
import './ButtonRow.css'

interface ButtonRowProps {
  label: string
  onClick: () => void
  children: ReactNode
  controls: ReactNode
}

export function ButtonRow({ label, onClick, children, controls }: ButtonRowProps) {
  return (
    <IonItem className="ion-activatable" detail={false} onClick={onClick}>
      {children}
      <button type="button" className="plain-button row-button" aria-label={label} />
      {controls}
    </IonItem>
  )
}
