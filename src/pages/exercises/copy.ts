export const EXERCISES_COPY = {
  emptyTitle: 'עוד אין תרגילים',
  emptyBody: 'תרגילים יופיעו כאן אחרי שתוסיפו אימון בלשונית אימונים או תסיימו אימון.',
  noResultsTitle: (query: string) => `אין תוצאות עבור ״${query}״`,
  noResultsBody: 'בדקו את האיות או נסו חיפוש אחר.',
  maxWeight: 'משקל מרבי',
  maxWeightTrend: (fromWeight: string, fromDate: string, toWeight: string, toDate: string) =>
    `משקל מרבי: מ־${fromWeight} ב־${fromDate} ל־${toWeight} ב־${toDate}`,
} as const
