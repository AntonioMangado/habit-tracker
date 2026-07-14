import { useEffect, useState } from 'react'
import { useHabitStore } from '@/store/useHabitStore'
import { AddHabitModal } from '@/components/AddHabitModal'

export default function App() {
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    useHabitStore.getState().initAuth()
  }, [])

  return (
    <main>
      <h1>Habit Tracker</h1>
      <button type="button" onClick={() => setModalOpen(true)}>
        Add habit
      </button>
      <AddHabitModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  )
}
