import { SETTINGS_COPY } from './copy'

export type FeedbackKind = 'bug' | 'idea'

const ISSUES_URL = 'https://github.com/Shalom-Borohov/workout-log/issues/new'

const MAX_TITLE = 80

const ISSUE_LABELS: Record<FeedbackKind, string> = { bug: 'bug', idea: 'enhancement' }

function title(text: string): string {
  const [first] = text.trim().split('\n')

  return first.length > MAX_TITLE ? `${first.slice(0, MAX_TITLE - 1)}…` : first
}

export function feedbackUrl(kind: FeedbackKind, text: string): string {
  const params = new URLSearchParams({
    title: title(text),
    body: SETTINGS_COPY.issueBody(text.trim(), navigator.userAgent, __BUILD_TIME__),
    labels: ISSUE_LABELS[kind],
  })

  return `${ISSUES_URL}?${params}`
}
