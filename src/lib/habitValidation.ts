export const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899',
] as const

export interface HabitFormValues {
  name: string
  color: string
  frequency: string
  hoursPerDay: string
}

export interface HabitFormErrors {
  name?: string
  frequency?: string
  hoursPerDay?: string
}

export function validateHabitForm(values: HabitFormValues): HabitFormErrors {
  const errors: HabitFormErrors = {}

  if (values.name.trim() === '') {
    errors.name = 'Name is required'
  }

  const freq = Number(values.frequency)
  if (
    values.frequency.trim() === '' ||
    !Number.isInteger(freq) ||
    freq < 1 ||
    freq > 7
  ) {
    errors.frequency = 'Frequency must be a whole number between 1 and 7'
  }

  const hours = Number(values.hoursPerDay)
  if (
    values.hoursPerDay.trim() === '' ||
    Number.isNaN(hours) ||
    hours <= 0
  ) {
    errors.hoursPerDay = 'Hours per day must be greater than 0'
  }

  return errors
}
