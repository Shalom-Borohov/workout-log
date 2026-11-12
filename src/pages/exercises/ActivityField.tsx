import { IonIcon, IonItem, IonLabel } from '@ionic/react'
import { chevronForward } from 'ionicons/icons'
import { useState } from 'react'
import type { Glyph } from '../../components/bodyArea/bodyAreaGlyphs'
import { GlyphIcon } from '../../components/bodyArea/GlyphIcon'
import { useSave } from '../../hooks/useSave'
import { ActivityFieldSheet } from './ActivityFieldSheet'

interface Props {
  label: string
  glyph: Glyph
  value: string
  placeholder: string
  multiline: boolean
  onSave: (value: string) => Promise<void>
}

const firstLine = (text: string) => text.split('\n', 1)[0]

export function ActivityField({ label, glyph, value, placeholder, multiline, onSave }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const { save } = useSave()
  const shown = multiline ? firstLine(value) : value

  function commit(next: string) {
    void save(() => onSave(next))
    setIsOpen(false)
  }

  return (
    <>
      <IonItem button detail={false} lines="none" className="field-row" onClick={() => setIsOpen(true)}>
        <IonLabel className="visually-hidden">{label}</IonLabel>
        <span className="field-row-value activity-field-value">
          <GlyphIcon glyph={glyph} className="activity-field-icon" />
          <span className="activity-field-text">{shown === '' ? placeholder : shown}</span>
          <IonIcon icon={chevronForward} flipRtl aria-hidden="true" />
        </span>
      </IonItem>
      <ActivityFieldSheet
        isOpen={isOpen}
        title={label}
        value={value}
        multiline={multiline}
        onCancel={() => setIsOpen(false)}
        onSave={commit}
      />
    </>
  )
}
