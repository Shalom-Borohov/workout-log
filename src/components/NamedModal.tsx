import { IonModal } from '@ionic/react'
import { type ComponentPropsWithRef, useMemo } from 'react'

type NamedModalProps = Omit<ComponentPropsWithRef<typeof IonModal>, 'aria-label' | 'htmlAttributes'> & { label: string }

export function NamedModal({ label, ...modalProps }: NamedModalProps) {
  const dialogAttributes = useMemo(() => ({ 'aria-label': label }), [label])

  return <IonModal key={label} htmlAttributes={dialogAttributes} {...modalProps} />
}
