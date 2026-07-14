import { useEffect } from 'react'
import { useHabitStore } from '@/store/useHabitStore'

export default function App() {
  useEffect(() => {
    useHabitStore.getState().initAuth()
  }, [])

  return (
    <main>
      <h1>Habit Tracker</h1>
    </main>
  )
}
