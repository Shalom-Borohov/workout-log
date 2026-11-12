import { COMMON_COPY } from '../../copy/common'
import { setActivityLocation, setActivityNote } from '../../data/activityDetails'
import { ActivityField } from './ActivityField'
import { LOCATION_GLYPH, NOTE_GLYPH } from './activityGlyphs'
import { EXERCISES_COPY } from './copy'

interface Props {
  name: string
  location: string
  note: string
}

export function ActivityFields({ name, location, note }: Props) {
  return (
    <>
      <ActivityField
        label={COMMON_COPY.location}
        glyph={LOCATION_GLYPH}
        value={location}
        placeholder={EXERCISES_COPY.addLocation}
        multiline={false}
        onSave={(value) => setActivityLocation(name, value)}
      />
      <ActivityField
        label={EXERCISES_COPY.note}
        glyph={NOTE_GLYPH}
        value={note}
        placeholder={EXERCISES_COPY.addNote}
        multiline
        onSave={(value) => setActivityNote(name, value)}
      />
    </>
  )
}
