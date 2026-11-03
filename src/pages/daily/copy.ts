export const DAILY_COPY = {
  emptyTitle: 'עוד אין אימון יומי',
  emptyBody: 'תרגילים קצרים שעושים כל יום, כמו יציבה. לוחצים על + כדי להוסיף, ואז מסמנים כאן כל יום שעשיתם אותם.',
  addDaily: 'הוספת אימון יומי',
  today: (name: string) => `${name}, היום`,
  previousMonth: 'החודש הקודם',
  nextMonth: 'החודש הבא',
  months: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
  monthTitle: (month: string, year: number) => `${month} ${year}`,
} as const
