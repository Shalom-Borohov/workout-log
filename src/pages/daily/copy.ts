const LABEL_SEPARATOR = ', '

export const DAILY_COPY = {
  emptyTitle: 'עוד אין אימון יומי',
  emptyBody: 'תרגילים קצרים שעושים כל יום, כמו יציבה. לוחצים על + כדי להוסיף, ואז מסמנים כאן כל יום שעשיתם אותם.',
  addDaily: 'הוספת אימון יומי',
  today: (name: string) => `${name}, היום`,
  previousMonth: 'החודש הקודם',
  nextMonth: 'החודש הבא',
  months: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
  monthTitle: (month: string, year: number) => `${month} ${year}`,
  onDay: (name: string, day: string) => `${name}${LABEL_SEPARATOR}${day}`,
  forDrill: (action: string, name: string) => `${action}${LABEL_SEPARATOR}${name}`,
  moreReps: 'יותר חזרות',
  fewerReps: 'פחות חזרות',
  moreSeconds: 'יותר שניות',
  fewerSeconds: 'פחות שניות',
  records: 'אימונים ופעילויות',
  archive: 'ארכיון',
  archived: 'בארכיון',
  restore: 'החזרה',
  dayLabel: (day: string, drills: string[], workouts: boolean) =>
    [day, ...drills, ...(workouts ? ['אימון'] : [])].join(LABEL_SEPARATOR),
} as const
