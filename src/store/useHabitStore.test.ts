import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('@/lib/firebase')

describe('useHabitStore', () => {
  let authCallback: ((user: any) => void) | null = null
  let habitsCallback: ((habits: any) => void) | null = null
  let entriesCallback: ((entries: any) => void) | null = null

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    authCallback = null
    habitsCallback = null
    entriesCallback = null

    const fb = await import('@/lib/firebase')
    vi.mocked(fb.subscribeToAuth).mockImplementation((cb: any) => {
      authCallback = cb
      return vi.fn()
    })
    vi.mocked(fb.subscribeToHabits).mockImplementation((_uid: string, cb: any) => {
      habitsCallback = cb
      return vi.fn()
    })
    vi.mocked(fb.subscribeToEntries).mockImplementation((_uid: string, cb: any) => {
      entriesCallback = cb
      return vi.fn()
    })
    vi.mocked(fb.signInWithGoogle).mockResolvedValue(undefined as any)
    vi.mocked(fb.signOut).mockResolvedValue(undefined)
    vi.mocked(fb.createHabit).mockResolvedValue(undefined)
    vi.mocked(fb.updateHabitDoc).mockResolvedValue(undefined)
    vi.mocked(fb.removeHabit).mockResolvedValue(undefined)
    vi.mocked(fb.setEntry).mockResolvedValue(undefined)
    vi.mocked(fb.deleteEntry).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('initAuth calls subscribeToAuth once', async () => {
    const fb = await import('@/lib/firebase')

    expect(vi.mocked(fb.subscribeToAuth)).not.toHaveBeenCalled()

    const { useHabitStore: store } = await import('@/store/useHabitStore')
    store.getState().initAuth()

    expect(vi.mocked(fb.subscribeToAuth)).toHaveBeenCalledTimes(1)
  })

  it('initAuth is idempotent', async () => {
    const fb = await import('@/lib/firebase')
    const { useHabitStore: store } = await import('@/store/useHabitStore')

    store.getState().initAuth()
    store.getState().initAuth()

    expect(vi.mocked(fb.subscribeToAuth)).toHaveBeenCalledTimes(1)
  })

  it('signing in sets user and authReady, subscribes to habits/entries', async () => {
    const fb = await import('@/lib/firebase')
    const { useHabitStore: store } = await import('@/store/useHabitStore')

    store.getState().initAuth()

    if (!authCallback) throw new Error('authCallback not set')
    authCallback({ uid: 'u1' })

    const state = store.getState()
    expect(state.user).toEqual({ uid: 'u1' })
    expect(state.authReady).toBe(true)
    expect(vi.mocked(fb.subscribeToHabits)).toHaveBeenCalledWith('u1', expect.any(Function))
    expect(vi.mocked(fb.subscribeToEntries)).toHaveBeenCalledWith('u1', expect.any(Function))
  })

  it('invoking habits snapshot callback updates habits', async () => {
    const { useHabitStore: store } = await import('@/store/useHabitStore')

    store.getState().initAuth()
    if (!authCallback) throw new Error('authCallback not set')
    authCallback({ uid: 'u1' })

    const mockHabits = [{ id: 'h1', name: 'Reading' }]
    if (!habitsCallback) throw new Error('habitsCallback not set')
    habitsCallback(mockHabits)

    const state = store.getState()
    expect(state.habits).toEqual(mockHabits)
  })

  it('invoking entries snapshot callback updates entries', async () => {
    const { useHabitStore: store } = await import('@/store/useHabitStore')

    store.getState().initAuth()
    if (!authCallback) throw new Error('authCallback not set')
    authCallback({ uid: 'u1' })

    const mockEntries = [{ id: 'e1', habitId: 'h1', date: '2024-01-01' }]
    if (!entriesCallback) throw new Error('entriesCallback not set')
    entriesCallback(mockEntries)

    const state = store.getState()
    expect(state.entries).toEqual(mockEntries)
  })

  it('signing out clears user, habits, entries, and unsubscribes', async () => {
    const { useHabitStore: store } = await import('@/store/useHabitStore')

    store.getState().initAuth()
    if (!authCallback) throw new Error('authCallback not set')
    authCallback({ uid: 'u1' })

    const mockHabits = [{ id: 'h1', name: 'Reading' }]
    if (!habitsCallback) throw new Error('habitsCallback not set')
    habitsCallback(mockHabits)

    // Mock the unsubscribe functions
    const mockUnsubHabits = vi.fn()
    const mockUnsubEntries = vi.fn()
    store.setState({ _unsubHabits: mockUnsubHabits, _unsubEntries: mockUnsubEntries }, false)

    // Sign out
    authCallback(null)

    const state = store.getState()
    expect(state.user).toBeNull()
    expect(state.authReady).toBe(true)
    expect(state.habits).toEqual([])
    expect(state.entries).toEqual([])
    expect(mockUnsubHabits).toHaveBeenCalled()
    expect(mockUnsubEntries).toHaveBeenCalled()
  })

  it('addHabit calls createHabit with correct uid and data', async () => {
    const fb = await import('@/lib/firebase')
    const { useHabitStore: store } = await import('@/store/useHabitStore')

    store.getState().initAuth()
    if (!authCallback) throw new Error('authCallback not set')
    authCallback({ uid: 'u1' })

    const newHabit = { name: 'Reading', description: 'Read daily', color: '#ff0000', frequency: 3, hoursPerDay: 1 }
    await store.getState().addHabit(newHabit)

    expect(vi.mocked(fb.createHabit)).toHaveBeenCalledWith('u1', newHabit)
  })

  it('updateHabit calls updateHabitDoc', async () => {
    const fb = await import('@/lib/firebase')
    const { useHabitStore: store } = await import('@/store/useHabitStore')

    store.getState().initAuth()
    if (!authCallback) throw new Error('authCallback not set')
    authCallback({ uid: 'u1' })

    const patch = { name: 'New Name' }
    await store.getState().updateHabit('h1', patch)

    expect(vi.mocked(fb.updateHabitDoc)).toHaveBeenCalledWith('u1', 'h1', patch)
  })

  it('deleteHabit calls removeHabit', async () => {
    const fb = await import('@/lib/firebase')
    const { useHabitStore: store } = await import('@/store/useHabitStore')

    store.getState().initAuth()
    if (!authCallback) throw new Error('authCallback not set')
    authCallback({ uid: 'u1' })

    await store.getState().deleteHabit('h1')

    expect(vi.mocked(fb.removeHabit)).toHaveBeenCalledWith('u1', 'h1')
  })

  it('toggleEntry creates entry if not exists', async () => {
    const fb = await import('@/lib/firebase')
    const { useHabitStore: store } = await import('@/store/useHabitStore')

    store.getState().initAuth()
    if (!authCallback) throw new Error('authCallback not set')
    authCallback({ uid: 'u1' })

    store.setState({ entries: [] }, false)

    await store.getState().toggleEntry('h1', '2024-01-01')

    expect(vi.mocked(fb.setEntry)).toHaveBeenCalledWith('u1', 'h1', '2024-01-01')
  })

  it('toggleEntry deletes entry if exists', async () => {
    const fb = await import('@/lib/firebase')
    const { useHabitStore: store } = await import('@/store/useHabitStore')

    store.getState().initAuth()
    if (!authCallback) throw new Error('authCallback not set')
    authCallback({ uid: 'u1' })

    const mockEntry = { id: 'h1_2024-01-01', habitId: 'h1', date: '2024-01-01', completedAt: '2024-01-01T12:00:00Z' }
    store.setState({ entries: [mockEntry] }, false)

    await store.getState().toggleEntry('h1', '2024-01-01')

    expect(vi.mocked(fb.deleteEntry)).toHaveBeenCalledWith('u1', 'h1_2024-01-01')
  })

  it('store actions are guarded when user is null', async () => {
    const fb = await import('@/lib/firebase')
    const { useHabitStore: store } = await import('@/store/useHabitStore')

    store.setState({ user: null }, false)

    await store.getState().addHabit({ name: 'Test', description: '', color: '#fff', frequency: 3, hoursPerDay: 1 })
    expect(vi.mocked(fb.createHabit)).not.toHaveBeenCalled()

    await store.getState().updateHabit('h1', { name: 'New' })
    expect(vi.mocked(fb.updateHabitDoc)).not.toHaveBeenCalled()

    await store.getState().deleteHabit('h1')
    expect(vi.mocked(fb.removeHabit)).not.toHaveBeenCalled()

    await store.getState().toggleEntry('h1', '2024-01-01')
    expect(vi.mocked(fb.setEntry)).not.toHaveBeenCalled()
  })

  it('signIn calls signInWithGoogle', async () => {
    const fb = await import('@/lib/firebase')
    const { useHabitStore: store } = await import('@/store/useHabitStore')

    await store.getState().signIn()

    expect(vi.mocked(fb.signInWithGoogle)).toHaveBeenCalled()
  })

  it('signOut calls fbSignOut', async () => {
    const fb = await import('@/lib/firebase')
    const { useHabitStore: store } = await import('@/store/useHabitStore')

    await store.getState().signOut()

    expect(vi.mocked(fb.signOut)).toHaveBeenCalled()
  })
})
