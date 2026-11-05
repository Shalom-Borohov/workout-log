export const ITEM_EDITOR_COPY = {
  editExercise: 'עריכת תרגיל',
  pair: 'זוג',
  deleteExercise: 'מחיקת התרגיל',
  addExerciseAfter: 'הוספת תרגיל אחרי',
  revealDelete: (title: string) => `הצגת מחיקה · ${title}`,
  deleteItem: (title: string) => `מחיקת ${title}`,
  minutes: 'דקות',
  startWeight: 'משקל התחלתי (ק״ג)',
  tips: 'דגשים',
  newExercise: 'תרגיל חדש',
} as const
