export type Frequency = 'daily' | 'weekly'

export interface Habit {
  id: string
  name: string
  description: string
  color: string
  frequency: Frequency
  createdAt: string
}

export interface HabitEntry {
  id: string
  habitId: string
  date: string
  completedAt: string
}

export type NewHabit = Omit<Habit, 'id' | 'createdAt'>
export type HabitPatch = Partial<Omit<Habit, 'id' | 'createdAt'>>
