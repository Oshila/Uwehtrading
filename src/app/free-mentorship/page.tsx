'use client'

import { useEffect, useState } from 'react'
import { firestore } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, doc, getDoc, Timestamp } from 'firebase/firestore'

interface Mentorship {
  id: string
  title: string
  description?: string
  zoomLink: string
  date: Timestamp | Date
}

export default function FreeMentorship() {
  const [sessions, setSessions] = useState<Mentorship[]>([])
  const [isAvailable, setIsAvailable] = useState(true)
  const [loading, setLoading] = useState(true)

  const fetchSessions = async (): Promise<void> => {
    setLoading(true)
    try {
      // ✅ Fetch config (availability)
      const configRef = doc(firestore, 'config', 'free_mentorship')
      const configSnap = await getDoc(configRef)
      const configData = configSnap.data() as { isAvailable?: boolean } | undefined
      const availability = configData?.isAvailable ?? true
      setIsAvailable(availability)

      if (availability) {
        // ✅ Fetch sessions
        const sessionsRef = collection(firestore, 'free_mentorship')
        const q = query(sessionsRef, orderBy('date', 'asc'))
        const snapshot = await getDocs(q)

        const fetchedSessions: Mentorship[] = snapshot.docs.map((d) => {
          const data = d.data() as {
            title: string
            description?: string
            zoomLink: string
            date: Timestamp | Date
          }
          return {
            id: d.id,
            title: data.title,
            description: data.description,
            zoomLink: data.zoomLink,
            date: data.date,
          }
        })

        setSessions(fetchedSessions)
      } else {
        setSessions([])
      }
    } catch (err) {
      console.error('Error fetching mentorship sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchSessions()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 animate-pulse">Loading mentorship sessions...</p>
      </div>
    )
  }

  if (!isAvailable) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Free Mentorship</h2>
        <p className="text-gray-500 italic">
          Free mentorship sessions are not available right now. Please check back later.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Free Mentorship Sessions</h2>

      {sessions.length === 0 ? (
        <p className="text-center text-gray-500 italic">
          No mentorship sessions available yet.
        </p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-gray-50 p-4 rounded shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
              <div>
                <h3 className="font-semibold text-lg">{session.title}</h3>
                {session.description && (
                  <p className="text-gray-600">{session.description}</p>
                )}
                <p className="text-gray-500 text-sm">
                  {session.date instanceof Timestamp
                    ? session.date.toDate().toLocaleString()
                    : new Date(session.date).toLocaleString()}
                </p>
              </div>
              <a
                href={session.zoomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
              >
                Join Zoom
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
