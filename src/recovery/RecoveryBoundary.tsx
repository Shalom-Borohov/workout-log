import { Component, type ReactNode } from 'react'
import { recordLastError } from '../data/lastError'
import { RecoveryScreen } from './RecoveryScreen'

interface RecoveryBoundaryProps {
  children: ReactNode
}

export class RecoveryBoundary extends Component<RecoveryBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    recordLastError(error)
  }

  render() {
    return this.state.failed ? <RecoveryScreen /> : this.props.children
  }
}
