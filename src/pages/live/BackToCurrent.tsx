import { LIVE_COPY } from './copy'
import './controls.css'

export function BackToCurrent({ onBack }: { onBack: () => void }) {
  return (
    <>
      <div className="back-to-current-space" />
      <div slot="fixed" className="back-to-current">
        <button type="button" className="plain-button back-to-current-pill" onClick={onBack}>
          {LIVE_COPY.backToCurrent}
        </button>
      </div>
    </>
  )
}
