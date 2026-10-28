const MINUTES_UNIT = 'דק׳'

const SECONDS_UNIT = 'שנ׳'

export const FORMAT_COPY = {
  weekdays: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
  day: (weekday: string, date: string) => `יום ${weekday} ${date}`,
  minutesUnit: MINUTES_UNIT,
  secondsUnit: SECONDS_UNIT,
  minutes: (amount: number | string) => `${amount} ${MINUTES_UNIT}`,
  seconds: (amount: number | string) => `${amount} ${SECONDS_UNIT}`,
  reps: (amounts: string) => `${amounts} חזרות`,
  kilograms: (weight: number) => `${weight} ק״ג`,
  notDone: 'לא בוצע',
  oneSet: 'סט אחד',
  oneWorkout: 'אימון אחד',
  workouts: 'אימונים',
  thisWeek: 'השבוע',
  lastWeek: 'שבוע שעבר',
} as const
