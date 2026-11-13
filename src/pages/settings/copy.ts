import type { DeviceDetails } from './phoneState'

const UNKNOWN = 'לא ידוע'

const BYTES_PER_MEGABYTE = 1_000_000

const megabytes = (bytes: number) => `${(bytes / BYTES_PER_MEGABYTE).toFixed(1)} MB`

function answer(value: boolean | null): string {
  if (value === null) {
    return UNKNOWN
  }

  return value ? 'כן' : 'לא'
}

export const SETTINGS_COPY = {
  backupRestored: 'הגיבוי שוחזר',
  undoRestore: 'ביטול השחזור',
  redoRestore: 'שחזור הגיבוי שוב',
  undoUntil: (date: string) => `אפשר עד ${date}`,
  restoreUndone: 'השחזור בוטל',
  restoreRedone: 'הגיבוי שוחזר שוב',
  backupFooter:
    'הנתונים נשמרים רק במכשיר הזה. הייצוא יוצר קובץ עם כל האימונים וההיסטוריה, שאפשר לשמור בקבצים ולשחזר ממנו בייבוא.',
  noBackupYet: 'עוד לא בוצע גיבוי',
  lastBackup: (when: string) => `גיבוי אחרון: ${when}`,
  history: 'היסטוריה',
  exportHistory: 'ייצוא היסטוריה',
  historyFooter: 'קובץ טקסט עם כל האימונים, לקריאה או לשמירה בפתקים.',
  accentFooter: 'הצבע של הסט הנוכחי, הכפתורים והסמלים.',
  background: 'רקע',
  backgroundPhoto: 'תמונת רקע',
  removeBackgroundPhoto: 'הסרת תמונת הרקע',
  backgroundFooter: 'התמונה מופיעה ברקע בזמן אימון. היא לא נכללת בגיבוי.',
  backgroundPhotoFile: 'קובץ תמונת רקע',
  photoUnsupported: 'אי אפשר לעבד את התמונה במכשיר הזה',
  photoUnreadable: 'אי אפשר לפתוח את הקובץ הזה כתמונה',
  reportBugOrIdea: 'דיווח על באג / הצעה',
  report: 'דיווח',
  bug: 'באג',
  idea: 'הצעה',
  description: 'תיאור',
  bugPlaceholder: 'מה קרה, ומה ציפית שיקרה?',
  ideaPlaceholder: 'מה היה עוזר לך?',
  feedbackFooter: 'הדיווח נפתח ב-GitHub, עם פרטי המכשיר, הגרסה וסוג השגיאה האחרונה. נתוני האימונים לא נשלחים.',
  feedbackTooLong: 'הדיווח ארוך מדי לקישור של GitHub. צריך לקצר אותו כדי לפתוח.',
  feedbackNotOpened: 'GitHub לא נפתח. הטקסט נשאר כאן, אפשר לנסות שוב.',
  openInGitHub: 'פתיחה ב-GitHub',
  issueBody: (text: string, device: DeviceDetails) =>
    [
      text,
      '',
      '### מכשיר',
      device.userAgent,
      `גרסה: ${device.version} (${device.buildTime})`,
      `אפליקציה ממסך הבית: ${answer(device.homeScreenApp)}`,
      `מחובר לרשת: ${answer(device.online)}`,
      `אחסון קבוע: ${answer(device.persisted)}`,
      `אחסון בשימוש: ${device.usage === null ? UNKNOWN : megabytes(device.usage)}`,
      ...(device.lastError === null ? [] : [`שגיאה אחרונה: ${device.lastError}`]),
    ].join('\n'),
  version: (version: string, updated: string) => `גרסה ${version} · עודכן ${updated}`,
} as const
