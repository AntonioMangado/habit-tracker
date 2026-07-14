import { initializeApp } from 'firebase/app'
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  signOut as fbSignOut, onAuthStateChanged,
} from 'firebase/auth'
import type { User, Unsubscribe } from 'firebase/auth'
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, addDoc, updateDoc, deleteDoc, setDoc,
  onSnapshot, query, where, getDocs, writeBatch,
} from 'firebase/firestore'
import type {
  CollectionReference, DocumentData, QueryDocumentSnapshot,
} from 'firebase/firestore'
import type { Habit, HabitEntry, NewHabit, HabitPatch } from '@/types'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

const googleProvider = new GoogleAuthProvider()

export function signInWithGoogle() { return signInWithPopup(auth, googleProvider) }
export function signOut() { return fbSignOut(auth) }
export function subscribeToAuth(cb: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, cb)
}

function habitsCol(uid: string): CollectionReference<DocumentData> {
  return collection(db, 'users', uid, 'habits')
}
function entriesCol(uid: string): CollectionReference<DocumentData> {
  return collection(db, 'users', uid, 'entries')
}

function toISO(v: unknown): string {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && 'toDate' in v && typeof (v as { toDate: () => Date }).toDate === 'function') {
    return (v as { toDate: () => Date }).toDate().toISOString()
  }
  return new Date().toISOString()
}

function mapHabit(d: QueryDocumentSnapshot<DocumentData>): Habit {
  const data = d.data()
  return {
    id: d.id,
    name: data.name,
    description: data.description,
    color: data.color,
    frequency: data.frequency,
    createdAt: toISO(data.createdAt),
  }
}

function mapEntry(d: QueryDocumentSnapshot<DocumentData>): HabitEntry {
  const data = d.data()
  return {
    id: d.id,
    habitId: data.habitId,
    date: data.date,
    completedAt: toISO(data.completedAt),
  }
}

export function subscribeToHabits(uid: string, cb: (habits: Habit[]) => void): Unsubscribe {
  return onSnapshot(habitsCol(uid), (snap) => cb(snap.docs.map(mapHabit)))
}

export function subscribeToEntries(uid: string, cb: (entries: HabitEntry[]) => void): Unsubscribe {
  return onSnapshot(entriesCol(uid), (snap) => cb(snap.docs.map(mapEntry)))
}

export function createHabit(uid: string, data: NewHabit): Promise<unknown> {
  return addDoc(habitsCol(uid), { ...data, createdAt: new Date().toISOString() })
}

export function updateHabitDoc(uid: string, id: string, patch: HabitPatch): Promise<void> {
  return updateDoc(doc(db, 'users', uid, 'habits', id), patch)
}

export async function removeHabit(uid: string, id: string): Promise<void> {
  const batch = writeBatch(db)
  batch.delete(doc(db, 'users', uid, 'habits', id))
  const entriesSnap = await getDocs(query(entriesCol(uid), where('habitId', '==', id)))
  entriesSnap.docs.forEach((entryDoc) => batch.delete(entryDoc.ref))
  await batch.commit()
}

export function setEntry(uid: string, habitId: string, date: string): Promise<void> {
  return setDoc(doc(entriesCol(uid), `${habitId}_${date}`), {
    habitId, date, completedAt: new Date().toISOString(),
  })
}

export function deleteEntry(uid: string, entryId: string): Promise<void> {
  return deleteDoc(doc(entriesCol(uid), entryId))
}
