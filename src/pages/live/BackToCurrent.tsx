import { LIVE_COPY } from './copy'
import './footer.css'

export function BackToCurrent({ onBack }: { onBack: () => void }) {
  return (
    <div className="back-to-current">
      <button type="button" className="plain-button plate back-to-current-pill" onClick={onBack}>
        {LIVE_COPY.backToCurrent}
      </button>
    </div>
  )
}
