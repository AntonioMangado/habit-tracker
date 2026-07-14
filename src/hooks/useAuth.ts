import { useHabitStore } from '@/store/useHabitStore'

export function useAuth() {
  const user = useHabitStore((s) => s.user)
  const authReady = useHabitStore((s) => s.authReady)
  const signIn = useHabitStore((s) => s.signIn)
  const signOut = useHabitStore((s) => s.signOut)
  return { user, authReady, signIn, signOut }
}
