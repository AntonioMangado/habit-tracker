import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock Firebase modules
vi.mock('firebase/app')
vi.mock('firebase/auth')
vi.mock('firebase/firestore')

describe('Firebase initialization', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key')
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project')
    vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test-bucket.appspot.com')
    vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789')
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app-id')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('initializes app with config from env vars', async () => {
    vi.resetModules()
    const { initializeApp } = await import('firebase/app')
    const mockInitApp = vi.fn((): any => ({ app: 'mock' }))
    vi.mocked(initializeApp).mockImplementation(mockInitApp)

    const { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } =
      await import('firebase/firestore')
    vi.mocked(persistentLocalCache).mockReturnValue({} as any)
    vi.mocked(persistentMultipleTabManager).mockReturnValue({} as any)
    vi.mocked(initializeFirestore).mockReturnValue({ db: 'mock' } as any)

    const { getAuth } = await import('firebase/auth')
    vi.mocked(getAuth).mockReturnValue({ auth: 'mock' } as any)

    const { app } = await import('@/lib/firebase')

    expect(mockInitApp).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      authDomain: 'test.firebaseapp.com',
      projectId: 'test-project',
      storageBucket: 'test-bucket.appspot.com',
      messagingSenderId: '123456789',
      appId: 'test-app-id',
    })
    expect(app).toBeDefined()
  })

  it('initializes auth with the app', async () => {
    vi.resetModules()
    const { initializeApp } = await import('firebase/app')
    vi.mocked(initializeApp).mockReturnValue({ app: 'mock' } as any)

    const { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } =
      await import('firebase/firestore')
    vi.mocked(persistentLocalCache).mockReturnValue({} as any)
    vi.mocked(persistentMultipleTabManager).mockReturnValue({} as any)
    vi.mocked(initializeFirestore).mockReturnValue({ db: 'mock' } as any)

    const { getAuth } = await import('firebase/auth')
    const mockGetAuth = vi.fn((): any => ({ auth: 'mock' }))
    vi.mocked(getAuth).mockImplementation(mockGetAuth)

    await import('@/lib/firebase')

    expect(mockGetAuth).toHaveBeenCalled()
  })

  it('initializes firestore with offline persistence cache', async () => {
    vi.resetModules()
    const { initializeApp } = await import('firebase/app')
    vi.mocked(initializeApp).mockReturnValue({ app: 'mock' } as any)

    const { getAuth } = await import('firebase/auth')
    vi.mocked(getAuth).mockReturnValue({ auth: 'mock' } as any)

    const { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } =
      await import('firebase/firestore')
    const mockPersistentCache = vi.fn((): any => ({} as any))
    const mockTabManager = vi.fn((): any => ({} as any))
    const mockInitFirestore = vi.fn((): any => ({ db: 'mock' } as any))

    vi.mocked(persistentLocalCache).mockImplementation(mockPersistentCache)
    vi.mocked(persistentMultipleTabManager).mockImplementation(mockTabManager)
    vi.mocked(initializeFirestore).mockImplementation(mockInitFirestore)

    await import('@/lib/firebase')

    expect(mockTabManager).toHaveBeenCalled()
    expect(mockPersistentCache).toHaveBeenCalled()
    expect(mockInitFirestore).toHaveBeenCalled()
  })

  it('exports auth and db', async () => {
    vi.resetModules()
    const { initializeApp } = await import('firebase/app')
    vi.mocked(initializeApp).mockReturnValue({ app: 'mock' } as any)

    const { getAuth } = await import('firebase/auth')
    vi.mocked(getAuth).mockReturnValue({ auth: 'mock' } as any)

    const { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } =
      await import('firebase/firestore')
    vi.mocked(persistentLocalCache).mockReturnValue({} as any)
    vi.mocked(persistentMultipleTabManager).mockReturnValue({} as any)
    vi.mocked(initializeFirestore).mockReturnValue({ db: 'mock' } as any)

    const fb = await import('@/lib/firebase')
    expect(fb.auth).toBeDefined()
    expect(fb.db).toBeDefined()
  })
})

describe('Auth functions', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key')
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project')
    vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test-bucket.appspot.com')
    vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789')
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app-id')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('signInWithGoogle calls signInWithPopup with auth and GoogleAuthProvider', async () => {
    vi.resetModules()
    const { initializeApp } = await import('firebase/app')
    vi.mocked(initializeApp).mockReturnValue({ app: 'mock' } as any)

    const { getAuth, signInWithPopup } = await import('firebase/auth')
    vi.mocked(getAuth).mockReturnValue({ auth: 'mock' } as any)

    const mockSignInWithPopup = vi.fn()
    vi.mocked(signInWithPopup).mockImplementation(mockSignInWithPopup)

    const { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } =
      await import('firebase/firestore')
    vi.mocked(persistentLocalCache).mockReturnValue({} as any)
    vi.mocked(persistentMultipleTabManager).mockReturnValue({} as any)
    vi.mocked(initializeFirestore).mockReturnValue({ db: 'mock' } as any)

    const fb = await import('@/lib/firebase')
    fb.signInWithGoogle()

    expect(mockSignInWithPopup).toHaveBeenCalled()
    const [auth, provider] = mockSignInWithPopup.mock.calls[0]
    expect(auth).toBeDefined()
    expect(provider).toBeDefined()
  })

  it('signOut calls fbSignOut with auth', async () => {
    vi.resetModules()
    const { initializeApp } = await import('firebase/app')
    vi.mocked(initializeApp).mockReturnValue({ app: 'mock' } as any)

    const { getAuth, signOut: fbSignOut } = await import('firebase/auth')
    vi.mocked(getAuth).mockReturnValue({ auth: 'mock' } as any)

    const mockSignOut = vi.fn()
    vi.mocked(fbSignOut).mockImplementation(mockSignOut)

    const { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } =
      await import('firebase/firestore')
    vi.mocked(persistentLocalCache).mockReturnValue({} as any)
    vi.mocked(persistentMultipleTabManager).mockReturnValue({} as any)
    vi.mocked(initializeFirestore).mockReturnValue({ db: 'mock' } as any)

    const fb = await import('@/lib/firebase')
    fb.signOut()

    expect(mockSignOut).toHaveBeenCalledWith(fb.auth)
  })

  it('subscribeToAuth calls onAuthStateChanged and returns unsubscribe', async () => {
    vi.resetModules()
    const { initializeApp } = await import('firebase/app')
    vi.mocked(initializeApp).mockReturnValue({ app: 'mock' } as any)

    const { getAuth, onAuthStateChanged } = await import('firebase/auth')
    vi.mocked(getAuth).mockReturnValue({ auth: 'mock' } as any)

    const mockUnsub = vi.fn()
    const mockOnAuthStateChanged = vi.fn(() => mockUnsub)
    vi.mocked(onAuthStateChanged).mockImplementation(mockOnAuthStateChanged)

    const { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } =
      await import('firebase/firestore')
    vi.mocked(persistentLocalCache).mockReturnValue({} as any)
    vi.mocked(persistentMultipleTabManager).mockReturnValue({} as any)
    vi.mocked(initializeFirestore).mockReturnValue({ db: 'mock' } as any)

    const fb = await import('@/lib/firebase')
    const callback = vi.fn()
    const unsub = fb.subscribeToAuth(callback)

    expect(mockOnAuthStateChanged).toHaveBeenCalledWith(fb.auth, callback)
    expect(unsub).toBe(mockUnsub)
  })
})

describe('Snapshot mappers', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key')
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project')
    vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test-bucket.appspot.com')
    vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789')
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app-id')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('subscribeToHabits maps habits with ISO string createdAt', async () => {
    vi.resetModules()
    const { initializeApp } = await import('firebase/app')
    vi.mocked(initializeApp).mockReturnValue({ app: 'mock' } as any)

    const { getAuth } = await import('firebase/auth')
    vi.mocked(getAuth).mockReturnValue({ auth: 'mock' } as any)

    const { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, onSnapshot } =
      await import('firebase/firestore')
    vi.mocked(persistentLocalCache).mockReturnValue({} as any)
    vi.mocked(persistentMultipleTabManager).mockReturnValue({} as any)
    vi.mocked(initializeFirestore).mockReturnValue({ db: 'mock' } as any)

    const mockSnap = {
      docs: [
        {
          id: 'h1',
          data: () => ({
            name: 'Reading',
            description: 'Read daily',
            color: '#ff0000',
            frequency: 'daily',
            createdAt: '2024-01-01T00:00:00.000Z',
          }),
        },
      ],
    }

    const mockOnSnapshot = vi.fn((_col: any, cb: any) => {
      cb(mockSnap as any)
      return vi.fn()
    })
    vi.mocked(onSnapshot).mockImplementation(mockOnSnapshot)

    const fb = await import('@/lib/firebase')
    const callback = vi.fn()
    fb.subscribeToHabits('u1', callback)

    expect(callback).toHaveBeenCalledWith([
      {
        id: 'h1',
        name: 'Reading',
        description: 'Read daily',
        color: '#ff0000',
        frequency: 'daily',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ])
  })

  it('subscribeToHabits maps habits with Timestamp-like createdAt', async () => {
    vi.resetModules()
    const { initializeApp } = await import('firebase/app')
    vi.mocked(initializeApp).mockReturnValue({ app: 'mock' } as any)

    const { getAuth } = await import('firebase/auth')
    vi.mocked(getAuth).mockReturnValue({ auth: 'mock' } as any)

    const { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, onSnapshot } =
      await import('firebase/firestore')
    vi.mocked(persistentLocalCache).mockReturnValue({} as any)
    vi.mocked(persistentMultipleTabManager).mockReturnValue({} as any)
    vi.mocked(initializeFirestore).mockReturnValue({ db: 'mock' } as any)

    const mockSnap = {
      docs: [
        {
          id: 'h1',
          data: () => ({
            name: 'Reading',
            description: 'Read daily',
            color: '#ff0000',
            frequency: 'daily',
            createdAt: {
              toDate: () => new Date('2024-01-01'),
            },
          }),
        },
      ],
    }

    const mockOnSnapshot = vi.fn((_col: any, cb: any) => {
      cb(mockSnap as any)
      return vi.fn()
    })
    vi.mocked(onSnapshot).mockImplementation(mockOnSnapshot)

    const fb = await import('@/lib/firebase')
    const callback = vi.fn()
    fb.subscribeToHabits('u1', callback)

    const result = callback.mock.calls[0][0]
    expect(result[0].id).toBe('h1')
    expect(result[0].name).toBe('Reading')
    expect(result[0].createdAt).toMatch(/2024-01-01T/)
  })

  it('subscribeToEntries maps entries correctly', async () => {
    vi.resetModules()
    const { initializeApp } = await import('firebase/app')
    vi.mocked(initializeApp).mockReturnValue({ app: 'mock' } as any)

    const { getAuth } = await import('firebase/auth')
    vi.mocked(getAuth).mockReturnValue({ auth: 'mock' } as any)

    const { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, onSnapshot } =
      await import('firebase/firestore')
    vi.mocked(persistentLocalCache).mockReturnValue({} as any)
    vi.mocked(persistentMultipleTabManager).mockReturnValue({} as any)
    vi.mocked(initializeFirestore).mockReturnValue({ db: 'mock' } as any)

    const mockSnap = {
      docs: [
        {
          id: 'e1',
          data: () => ({
            habitId: 'h1',
            date: '2024-01-01',
            completedAt: '2024-01-01T12:00:00.000Z',
          }),
        },
      ],
    }

    const mockOnSnapshot = vi.fn((_col: any, cb: any) => {
      cb(mockSnap as any)
      return vi.fn()
    })
    vi.mocked(onSnapshot).mockImplementation(mockOnSnapshot)

    const fb = await import('@/lib/firebase')
    const callback = vi.fn()
    fb.subscribeToEntries('u1', callback)

    expect(callback).toHaveBeenCalledWith([
      {
        id: 'e1',
        habitId: 'h1',
        date: '2024-01-01',
        completedAt: '2024-01-01T12:00:00.000Z',
      },
    ])
  })
})

describe('Firestore writes', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key')
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project')
    vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test-bucket.appspot.com')
    vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789')
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app-id')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('createHabit calls addDoc with createdAt as ISO string', async () => {
    vi.resetModules()
    const { initializeApp } = await import('firebase/app')
    vi.mocked(initializeApp).mockReturnValue({ app: 'mock' } as any)

    const { getAuth } = await import('firebase/auth')
    vi.mocked(getAuth).mockReturnValue({ auth: 'mock' } as any)

    const {
      initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
      collection, addDoc,
    } = await import('firebase/firestore')
    vi.mocked(persistentLocalCache).mockReturnValue({} as any)
    vi.mocked(persistentMultipleTabManager).mockReturnValue({} as any)
    vi.mocked(initializeFirestore).mockReturnValue({ db: 'mock' } as any)

    const mockCollection = vi.fn(() => ({ col: 'mock' } as any))
    const mockAddDoc = vi.fn(async (..._args: any[]) => ({ ref: 'newRef' }))

    vi.mocked(collection).mockImplementation(mockCollection)
    vi.mocked(addDoc).mockImplementation(mockAddDoc as any)

    const fb = await import('@/lib/firebase')
    await fb.createHabit('u1', {
      name: 'Reading',
      description: 'Read daily',
      color: '#ff0000',
      frequency: 'daily',
    })

    expect(mockAddDoc).toHaveBeenCalled()
    const [_, dataArg] = mockAddDoc.mock.calls[0]
    expect(dataArg.name).toBe('Reading')
    expect(dataArg.createdAt).toBeDefined()
    expect(typeof dataArg.createdAt).toBe('string')
    expect(dataArg.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('updateHabitDoc calls updateDoc with patch', async () => {
    vi.resetModules()
    const { initializeApp } = await import('firebase/app')
    vi.mocked(initializeApp).mockReturnValue({ app: 'mock' } as any)

    const { getAuth } = await import('firebase/auth')
    vi.mocked(getAuth).mockReturnValue({ auth: 'mock' } as any)

    const {
      initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
      doc, updateDoc,
    } = await import('firebase/firestore')
    vi.mocked(persistentLocalCache).mockReturnValue({} as any)
    vi.mocked(persistentMultipleTabManager).mockReturnValue({} as any)
    vi.mocked(initializeFirestore).mockReturnValue({ db: 'mock' } as any)

    const mockDoc = vi.fn(() => ({ doc: 'mock' } as any))
    const mockUpdateDoc = vi.fn(async (..._args: any[]) => undefined)

    vi.mocked(doc).mockImplementation(mockDoc as any)
    vi.mocked(updateDoc).mockImplementation(mockUpdateDoc as any)

    const fb = await import('@/lib/firebase')
    await fb.updateHabitDoc('u1', 'h1', { name: 'Updated Name' })

    expect(mockUpdateDoc).toHaveBeenCalled()
    const patch = mockUpdateDoc.mock.calls[0][1]
    expect(patch).toEqual({ name: 'Updated Name' })
  })

  it('removeHabit deletes habit and cascades to entries', async () => {
    vi.resetModules()
    const { initializeApp } = await import('firebase/app')
    vi.mocked(initializeApp).mockReturnValue({ app: 'mock' } as any)

    const { getAuth } = await import('firebase/auth')
    vi.mocked(getAuth).mockReturnValue({ auth: 'mock' } as any)

    const {
      initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
      collection, doc, writeBatch, getDocs, query, where,
    } = await import('firebase/firestore')
    vi.mocked(persistentLocalCache).mockReturnValue({} as any)
    vi.mocked(persistentMultipleTabManager).mockReturnValue({} as any)
    vi.mocked(initializeFirestore).mockReturnValue({ db: 'mock' } as any)

    const mockDelete = vi.fn()
    const mockCommit = vi.fn(async () => undefined)
    const mockBatch = {
      delete: mockDelete,
      commit: mockCommit,
    }

    const mockDoc = vi.fn(() => ({ doc: 'mock' } as any))
    const mockCollection = vi.fn(() => ({ col: 'mock' } as any))
    const mockQuery = vi.fn((..._args: any[]) => ({ query: 'mock' }))
    const mockWhere = vi.fn(() => ({ where: 'mock' }))
    const mockWriteBatch = vi.fn(() => mockBatch as any)
    const mockGetDocs = vi.fn(async () => ({
      docs: [
        { ref: 'entryRef1' },
        { ref: 'entryRef2' },
      ],
    }))

    vi.mocked(collection).mockImplementation(mockCollection)
    vi.mocked(doc).mockImplementation(mockDoc as any)
    vi.mocked(query).mockImplementation(mockQuery as any)
    vi.mocked(where).mockImplementation(mockWhere as any)
    vi.mocked(writeBatch).mockImplementation(mockWriteBatch)
    vi.mocked(getDocs).mockImplementation(mockGetDocs as any)

    const fb = await import('@/lib/firebase')
    await fb.removeHabit('u1', 'h1')

    // Verify batch operations
    expect(mockDelete).toHaveBeenCalledTimes(3) // 1 habit + 2 entries
    expect(mockCommit).toHaveBeenCalledTimes(1)

    // Verify cascade query happened
    expect(mockQuery).toHaveBeenCalled()
    expect(mockWhere).toHaveBeenCalled()
    expect(mockGetDocs).toHaveBeenCalled()
  })

  it('setEntry calls setDoc with deterministic id and completedAt as ISO string', async () => {
    vi.resetModules()
    const { initializeApp } = await import('firebase/app')
    vi.mocked(initializeApp).mockReturnValue({ app: 'mock' } as any)

    const { getAuth } = await import('firebase/auth')
    vi.mocked(getAuth).mockReturnValue({ auth: 'mock' } as any)

    const {
      initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
      collection, doc, setDoc,
    } = await import('firebase/firestore')
    vi.mocked(persistentLocalCache).mockReturnValue({} as any)
    vi.mocked(persistentMultipleTabManager).mockReturnValue({} as any)
    vi.mocked(initializeFirestore).mockReturnValue({ db: 'mock' } as any)

    const mockCollection = vi.fn(() => ({ col: 'mock' } as any))
    const mockDoc = vi.fn((_col: any, id: any) => ({ docId: id }))
    const mockSetDoc = vi.fn(async (..._args: any[]) => undefined)

    vi.mocked(collection).mockImplementation(mockCollection)
    vi.mocked(doc).mockImplementation(mockDoc as any)
    vi.mocked(setDoc).mockImplementation(mockSetDoc as any)

    const fb = await import('@/lib/firebase')
    await fb.setEntry('u1', 'h1', '2024-01-01')

    expect(mockDoc).toHaveBeenCalled()
    const docCallArgs = mockDoc.mock.calls[mockDoc.mock.calls.length - 1]
    expect(docCallArgs[1]).toBe('h1_2024-01-01')

    expect(mockSetDoc).toHaveBeenCalled()
    const [_, dataArg] = mockSetDoc.mock.calls[0]
    expect(dataArg.habitId).toBe('h1')
    expect(dataArg.date).toBe('2024-01-01')
    expect(dataArg.completedAt).toBeDefined()
    expect(typeof dataArg.completedAt).toBe('string')
    expect(dataArg.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('deleteEntry calls deleteDoc', async () => {
    vi.resetModules()
    const { initializeApp } = await import('firebase/app')
    vi.mocked(initializeApp).mockReturnValue({ app: 'mock' } as any)

    const { getAuth } = await import('firebase/auth')
    vi.mocked(getAuth).mockReturnValue({ auth: 'mock' } as any)

    const {
      initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
      collection, doc, deleteDoc,
    } = await import('firebase/firestore')
    vi.mocked(persistentLocalCache).mockReturnValue({} as any)
    vi.mocked(persistentMultipleTabManager).mockReturnValue({} as any)
    vi.mocked(initializeFirestore).mockReturnValue({ db: 'mock' } as any)

    const mockCollection = vi.fn(() => ({ col: 'mock' } as any))
    const mockDoc = vi.fn(() => ({ doc: 'mock' } as any))
    const mockDeleteDoc = vi.fn(async (..._args: any[]) => undefined)

    vi.mocked(collection).mockImplementation(mockCollection)
    vi.mocked(doc).mockImplementation(mockDoc as any)
    vi.mocked(deleteDoc).mockImplementation(mockDeleteDoc as any)

    const fb = await import('@/lib/firebase')
    await fb.deleteEntry('u1', 'e1')

    expect(mockDeleteDoc).toHaveBeenCalled()
    expect(mockDeleteDoc).toHaveBeenCalledWith({ doc: 'mock' })
  })
})
