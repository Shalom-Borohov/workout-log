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

import { App } from './App'
import { pageTransition, trackTaps } from './navigation/swipeBack'
import { guardTapsDuringTransitions } from './navigation/tapGuard'

setupIonicReact({ mode: 'ios', swipeBackEnabled: false, navAnimation: pageTransition })

guardTapsDuringTransitions(document)
trackTaps(document)

navigator.storage?.persist?.()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
