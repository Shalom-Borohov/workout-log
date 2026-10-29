export const ROUTINES_COPY = {
  noRoutinesYet: 'אין עדיין אימונים',
  noRoutinesBody: 'מדביקים את הפתק של האימון, והאפליקציה מפרקת אותו לחלקים ולתרגילים. או בונים אימון מאפס.',
  pasteNoteHint: 'מהפתקים באייפון',
  emptyRoutineHint: 'מוסיפים חלקים ותרגילים בעצמכם',
  addRoutine: 'הוספת אימון',
  start: 'התחל',
  duplicate: 'שכפול',
  oneExercise: 'תרגיל אחד',
  oneSection: 'חלק אחד',
  sections: 'חלקים',
  created: (date: string) => `נוצר ${date}`,
  editRoutine: 'עריכת אימון',
  newSection: 'חלק חדש',
  addSection: 'הוספת חלק',
  sectionName: 'שם החלק',
  deleteSection: 'מחיקת החלק',
  deleteSectionQuestion: 'למחוק את החלק?',
  note: 'פתק',
  notePlaceholder: `הדביקו כאן את הפתק, למשל:
אימון רגליים
חימום 2 סטים:
אופניים 5 דקות

עיקרי 3 סטים:
סקוואט 12 -> מתח 8`,
  noteSyntaxHint: 'שורה שמסתיימת ב״סטים:״ פותחת חלק, ו־-> מחבר שני תרגילים לזוג.',
  missingRepsHint: 'תרגיל עם ? חסר בו מספר חזרות. אפשר לתקן אחרי השמירה.',
  checkResultHint: 'בדקו את התוצאה. אפשר לתקן אחרי השמירה.',
} as const
