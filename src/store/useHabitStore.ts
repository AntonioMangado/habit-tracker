import { create } from 'zustand'
import type { User, Unsubscribe } from 'firebase/auth'
import type { Habit, HabitEntry, NewHabit, HabitPatch } from '@/types'
import * as fb from '@/lib/firebase'

interface HabitState {
  user: User | null
  authReady: boolean
  habits: Habit[]
  entries: HabitEntry[]
  _unsubHabits: Unsubscribe | null
  _unsubEntries: Unsubscribe | null
  _unsubAuth: Unsubscribe | null

  initAuth: () => void
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  addHabit: (data: NewHabit) => Promise<void>
  updateHabit: (id: string, patch: HabitPatch) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  toggleEntry: (habitId: string, date: string) => Promise<void>
}

export const useHabitStore = create<HabitState>((set, get) => ({
  user: null,
  authReady: false,
  habits: [],
  entries: [],
  _unsubHabits: null,
  _unsubEntries: null,
  _unsubAuth: null,

  initAuth: () => {
    if (get()._unsubAuth) return // idempotent guard against StrictMode double-invoke
    const unsubAuth = fb.subscribeToAuth((user) => {
      const { _unsubHabits, _unsubEntries } = get()
      if (_unsubHabits) _unsubHabits()
      if (_unsubEntries) _unsubEntries()

      if (user) {
        const unsubHabits = fb.subscribeToHabits(user.uid, (habits) => set({ habits }))
        const unsubEntries = fb.subscribeToEntries(user.uid, (entries) => set({ entries }))
        set({ user, authReady: true, _unsubHabits: unsubHabits, _unsubEntries: unsubEntries })
      } else {
        set({ user: null, authReady: true, habits: [], entries: [], _unsubHabits: null, _unsubEntries: null })
      }
    })
    set({ _unsubAuth: unsubAuth })
  },

  signIn: async () => { await fb.signInWithGoogle() },
  signOut: async () => { await fb.signOut() },

  addHabit: async (data) => {
    const { user } = get()
    if (!user) return
    await fb.createHabit(user.uid, data)
  },

  updateHabit: async (id, patch) => {
    const { user } = get()
    if (!user) return
    await fb.updateHabitDoc(user.uid, id, patch)
  },

  deleteHabit: async (id) => {
    const { user } = get()
    if (!user) return
    await fb.removeHabit(user.uid, id)
  },

  toggleEntry: async (habitId, date) => {
    const { user, entries } = get()
    if (!user) return
    const existing = entries.find((e) => e.habitId === habitId && e.date === date)
    if (existing) {
      await fb.deleteEntry(user.uid, existing.id)
    } else {
      await fb.setEntry(user.uid, habitId, date)
    }
  },
}))
