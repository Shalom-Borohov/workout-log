import { IonApp } from '@ionic/react'
import { IonReactMemoryRouter } from '@ionic/react-router'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AppRoutes } from '../../src/App'
import { LocationProbe } from './LocationProbe'

export function renderAt(path: string, extra?: ReactNode) {
  return render(
    <IonApp>
      <IonReactMemoryRouter initialEntries={[path]}>
        <AppRoutes />
        <LocationProbe />
        {extra}
      </IonReactMemoryRouter>
    </IonApp>,
  )
}

export function currentPath() {
  return screen.getByTestId('location').textContent
}
