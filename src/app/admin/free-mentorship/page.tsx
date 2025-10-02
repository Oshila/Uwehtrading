'use client'

import { useEffect, useState } from 'react'
import { firestore } from '@/lib/firebase'
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'

type Mentorship = {
  id: string
  title: string
  description?: string
  zoomLink: string
  date: Timestamp | Date
}

export default function AdminFreeMentorship() {
  const [sessions, setSessions] = useState<Mentorship[]>([])
  const [loading, setLoading] = useState(true)
  const [isAvailable, setIsAvailable] = useState(true)

  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newZoomLink, setNewZoomLink] = useState('')
  const [newDate, setNewDate] = useState('')

  // Ensure config doc exists
  const ensureConfig = async () => {
    const configRef = doc(firestore, 'config', 'free_mentorship')
    const snap = await getDoc(configRef)
    if (!snap.exists()) {
      await setDoc(configRef, { isAvailable: true })
    }
  }

  // Fetch sessions and availability
  const fetchSessions = async () => {
    setLoading(true)
    try {
      await ensureConfig()

      const configRef = doc(firestore, 'config', 'free_mentorship')
      const configSnap = await getDoc(configRef)
      setIsAvailable(configSnap.data()?.isAvailable ?? true)

      const sessionsRef = collection(firestore, 'free_mentorship')
      const q = query(sessionsRef, orderBy('date', 'asc'))
      const snapshot = await getDocs(q)
      const fetchedSessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date ?? new Date(),
      })) as Mentorship[]
      setSessions(fetchedSessions)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const toggleAvailability = async () => {
    try {
      const configRef = doc(firestore, 'config', 'free_mentorship')
      await setDoc(configRef, { isAvailable: !isAvailable }, { merge: true })
      setIsAvailable(!isAvailable)
    } catch (err) {
      console.error('Error toggling availability:', err)
    }
  }

  const handleAddSession = async () => {
    if (!newTitle || !newZoomLink || !newDate) return
    try {
      await addDoc(collection(firestore, 'free_mentorship'), {
        title: newTitle,
        description: newDescription,
        zoomLink: newZoomLink,
        date: Timestamp.fromDate(new Date(newDate)),
        createdBy: 'admin',
        timestamp: new Date(),
      })
      setNewTitle('')
      setNewDescription('')
      setNewZoomLink('')
      setNewDate('')
      fetchSessions()
    } catch (err) {
      console.error('Error adding session:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return
    try {
      await deleteDoc(doc(firestore, 'free_mentorship', id))
      fetchSessions()
    } catch (err) {
      console.error('Error deleting session:', err)
    }
  }

  if (loading) return <p className="text-center mt-6">Loading...</p>

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Free Mentorships</h1>

      <button
        onClick={toggleAvailability}
        className={`mb-6 px-4 py-2 rounded ${
          isAvailable ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
        } text-white transition`}
      >
        {isAvailable ? 'Disable Free Mentorships' : 'Enable Free Mentorships'}
      </button>

      {isAvailable && (
        <div className="mb-6 space-y-3">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Title"
            className="w-full border rounded px-3 py-2"
          />
          <textarea
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            value={newZoomLink}
            onChange={e => setNewZoomLink(e.target.value)}
            placeholder="Zoom Link"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="datetime-local"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <button
            onClick={handleAddSession}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
          >
            Add Mentorship Session
          </button>
        </div>
      )}

      <div className="space-y-3">
        {sessions.length === 0 && <p className="text-gray-500">No mentorship sessions yet.</p>}
        {sessions.map(session => (
          <div
            key={session.id}
            className="bg-gray-100 p-4 rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold">{session.title}</h2>
              {session.description && <p className="text-gray-600">{session.description}</p>}
              <p className="text-gray-500 text-sm">
                {session.date instanceof Timestamp
                  ? session.date.toDate().toLocaleString()
                  : new Date(session.date).toLocaleString()}
              </p>
              <a
                href={session.zoomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Join Zoom
              </a>
            </div>
            <button
              onClick={() => handleDelete(session.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
