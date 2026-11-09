import { IonItem, IonLabel, IonList, IonListHeader, IonNote } from '@ionic/react'
import { useId } from 'react'
import { accentSwatchStyle, applyAccentColor } from '../../components/accentColor'
import { Swatches } from '../../components/Swatches'
import { COMMON_COPY } from '../../copy/common'
import { saveAccentColor, useAccentColor } from '../../data/accentColor'
import { ACCENT_COLORS, type AccentColor } from '../../domain/accentColors'
import { SETTINGS_COPY } from './copy'
import './accentSettings.css'

export function AccentSettings() {
  const headerId = useId()
  const accent = useAccentColor()

  function choose(color: AccentColor) {
    saveAccentColor(color)
    applyAccentColor(color)
  }

  return (
    <>
      <IonListHeader id={headerId}>
        <IonLabel>{COMMON_COPY.color}</IonLabel>
      </IonListHeader>
      <IonList inset>
        <IonItem className="accent-item">
          <fieldset className="swatch-fieldset accent-picker" aria-labelledby={headerId}>
            <Swatches
              options={ACCENT_COLORS}
              columns={ACCENT_COLORS.length}
              value={accent}
              swatchStyle={accentSwatchStyle}
              onChange={choose}
            />
          </fieldset>
        </IonItem>
      </IonList>
      <IonNote className="list-footer">{SETTINGS_COPY.accentFooter}</IonNote>
    </>
  )
}
