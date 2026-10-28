export const APP_COPY = {
  workoutInProgress: 'יש אימון בתהליך',
  resumeWorkout: (routineName: string) => `המשך את ${routineName}`,
  invalidBackup: 'קובץ הגיבוי לא תקין',
  improvement: 'שיפור',
  newRecord: 'שיא חדש',
  defaultSectionName: 'עיקרי',
  defaultExerciseName: 'תרגיל חדש',
  copyName: (name: string) => `${name} (עותק)`,
} as const
