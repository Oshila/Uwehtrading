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
  isActive?: boolean
}

export default function AdminFreeMentorship() {
  const [sessions, setSessions] = useState<Mentorship[]>([])
  const [loading, setLoading] = useState(true)
  const [isAvailable, setIsAvailable] = useState(true)

  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newZoomLink, setNewZoomLink] = useState('')
  const [newDate, setNewDate] = useState('')

  // 🔹 Ensure config doc exists
  const ensureConfig = async () => {
    const configRef = doc(firestore, 'config', 'free_mentorship')
    const snap = await getDoc(configRef)
    if (!snap.exists()) {
      await setDoc(configRef, { isAvailable: true })
    }
  }

  // 🔹 Fetch sessions + availability
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
      const fetchedSessions = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        date: d.data().date ?? new Date(),
      })) as Mentorship[]
      setSessions(fetchedSessions)
    } catch (err) {
      console.error('Error fetching mentorships:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  // 🔹 Toggle global availability
  const toggleAvailability = async () => {
    try {
      const configRef = doc(firestore, 'config', 'free_mentorship')
      await setDoc(configRef, { isAvailable: !isAvailable }, { merge: true })
      setIsAvailable(!isAvailable)
    } catch (err) {
      console.error('Error toggling availability:', err)
    }
  }

  // 🔹 Add a new mentorship session
  const handleAddSession = async () => {
    if (!newTitle || !newZoomLink || !newDate) return
    try {
      await addDoc(collection(firestore, 'free_mentorship'), {
        title: newTitle,
        description: newDescription,
        zoomLink: newZoomLink,
        date: Timestamp.fromDate(new Date(newDate)),
        isActive: false, // default inactive until admin enables it
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

  // 🔹 Delete a session
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return
    try {
      await deleteDoc(doc(firestore, 'free_mentorship', id))
      fetchSessions()
    } catch (err) {
      console.error('Error deleting session:', err)
    }
  }

  // 🔹 Edit a session
  const handleEdit = async (session: Mentorship) => {
    const newTitle = prompt('Edit title:', session.title)
    const newDescription = prompt('Edit description:', session.description || '')
    const newZoomLink = prompt('Edit Zoom link:', session.zoomLink)
    const newDate = prompt(
      'Edit date/time (YYYY-MM-DDTHH:mm):',
      new Date(
        session.date instanceof Timestamp ? session.date.toDate() : session.date
      )
        .toISOString()
        .slice(0, 16)
    )

    if (!newTitle || !newZoomLink || !newDate) return

    try {
      await setDoc(
        doc(firestore, 'free_mentorship', session.id),
        {
          title: newTitle,
          description: newDescription,
          zoomLink: newZoomLink,
          date: Timestamp.fromDate(new Date(newDate)),
        },
        { merge: true }
      )
      fetchSessions()
    } catch (err) {
      console.error('Error editing session:', err)
    }
  }

  // 🔹 Toggle session active/inactive
  const toggleSessionActive = async (id: string, newStatus: boolean) => {
    try {
      await setDoc(doc(firestore, 'free_mentorship', id), { isActive: newStatus }, { merge: true })
      fetchSessions()
    } catch (err) {
      console.error('Error updating active state:', err)
    }
  }

  if (loading) return <p className="text-center mt-6">Loading mentorship data...</p>

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Admin — Free Mentorships</h1>

      {/* Toggle global availability */}
      <button
        onClick={toggleAvailability}
        className={`mb-6 px-4 py-2 rounded ${
          isAvailable ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
        } text-white transition`}
      >
        {isAvailable ? 'Disable Free Mentorships' : 'Enable Free Mentorships'}
      </button>

      {/* Add new session */}
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

      {/* Session List */}
      <div className="space-y-3">
        {sessions.length === 0 && <p className="text-gray-500">No mentorship sessions yet.</p>}

        {sessions.map(session => (
          <div
            key={session.id}
            className="bg-gray-100 p-4 rounded shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >
            <div>
              <h2 className="font-semibold">{session.title}</h2>
              {session.description && <p className="text-gray-600">{session.description}</p>}
              <p className="text-gray-500 text-sm">
                {session.date instanceof Timestamp
                  ? session.date.toDate().toLocaleString()
                  : new Date(session.date).toLocaleString()}
              </p>

              <p className="text-sm mt-1">
                Status:{' '}
                <span className={session.isActive ? 'text-green-600' : 'text-red-500'}>
                  {session.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>

              <a
                href={session.isActive ? session.zoomLink : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={`block mt-2 ${
                  session.isActive
                    ? 'text-blue-600 hover:underline'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {session.isActive ? 'Join Zoom' : 'Link not active yet'}
              </a>
            </div>

            <div className="flex gap-2 mt-3 sm:mt-0">
              <button
                onClick={() => handleEdit(session)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition"
              >
                Edit
              </button>
              <button
                onClick={() => toggleSessionActive(session.id, !session.isActive)}
                className={`${
                  session.isActive
                    ? 'bg-gray-500 hover:bg-gray-600'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white px-3 py-1 rounded transition`}
              >
                {session.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDelete(session.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
