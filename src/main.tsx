import { setupIonicReact } from '@ionic/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
import '@ionic/react/css/padding.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'
import '@ionic/react/css/palettes/dark.system.css'
import './theme.css'
import './tapTargets.css'

import { App } from './App'
import { recordLastError } from './data/lastError'
import { dropExpiredRestoreUndo } from './data/restore'
import { blockSystemEdgeSwipe } from './navigation/edgeSwipe'
import { guardTapsDuringTransitions } from './navigation/tapGuard'

setupIonicReact({ mode: 'ios' })

guardTapsDuringTransitions(document)
blockSystemEdgeSwipe(document)

navigator.storage?.persist?.()

dropExpiredRestoreUndo(Date.now()).catch(recordLastError)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
