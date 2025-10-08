'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { firestore } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, doc, getDoc, Timestamp } from 'firebase/firestore'

type Mentorship = {
  id: string
  title: string
  description?: string
  zoomLink: string
  date: Timestamp | Date
  isActive?: boolean
  isCompleted?: boolean
}

export default function FreeMentorship() {
  const [upcomingSessions, setUpcomingSessions] = useState<Mentorship[]>([])
  const [pastSessions, setPastSessions] = useState<Mentorship[]>([])
  const [isAvailable, setIsAvailable] = useState(true)
  const [loading, setLoading] = useState(true)

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const configRef = doc(firestore, 'config', 'free_mentorship')
      const configSnap = await getDoc(configRef)
      const availability = configSnap.exists() ? configSnap.data()?.isAvailable ?? true : true
      setIsAvailable(availability)

      if (availability) {
        const sessionsRef = collection(firestore, 'free_mentorship')
        const q = query(sessionsRef, orderBy('date', 'asc'))
        const snapshot = await getDocs(q)

        const fetchedSessions: Mentorship[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data()
          return {
            id: docSnap.id,
            title: data.title,
            description: data.description,
            zoomLink: data.zoomLink,
            date: data.date,
            isActive: data.isActive ?? false,
            isCompleted: data.isCompleted ?? false,
          }
        })

        // Separate upcoming vs past sessions
        const upcoming = fetchedSessions.filter(s => !s.isCompleted)
        const past = fetchedSessions.filter(s => s.isCompleted)

        setUpcomingSessions(upcoming)
        setPastSessions(past)
      } else {
        setUpcomingSessions([])
        setPastSessions([])
      }
    } catch (err) {
      console.error('Error fetching mentorship data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
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
      <h2 className="text-3xl font-bold mb-3 text-center text-gray-800">
        Free Mentorship Sessions
      </h2>

      {/* ✅ Motivational Text */}
      <p className="text-center text-gray-700 mb-6 text-sm sm:text-base">
        📊 <strong>Want to level up your trading skills?</strong><br />
        Join our <strong>FREE Online Mentorship Class</strong> — 3 months of expert guidance!<br />
        <span className="text-blue-600 font-medium">#ForexLearning #UwehsTradeHub</span>
      </p>

      {/* ✅ Local banner from /public */}
      <div className="mb-6">
        <Image
          src="/IMG_6246.jpeg"
          alt="Free mentorship banner"
          width={1200}
          height={500}
          className="rounded-lg shadow-md w-full object-cover"
          priority
        />
      </div>

      {/* --- Active & Upcoming Sessions --- */}
      <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Upcoming Sessions</h3>

      {upcomingSessions.length === 0 && (
        <p className="text-center text-gray-500 italic">No upcoming mentorship sessions yet.</p>
      )}

      <div className="space-y-4 mb-10">
        {upcomingSessions.map(session => (
          <div
            key={session.id}
            className="bg-gray-50 p-4 rounded shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >
            <div>
              <h3 className="font-semibold text-lg">{session.title}</h3>
              {session.description && <p className="text-gray-600">{session.description}</p>}
              <p className="text-gray-500 text-sm">
                {session.date instanceof Timestamp
                  ? session.date.toDate().toLocaleString()
                  : new Date(session.date).toLocaleString()}
              </p>

              <p className="text-sm mt-1">
                Status:{' '}
                <span className={session.isActive ? 'text-green-600' : 'text-orange-500'}>
                  {session.isActive ? 'Active' : 'Not Active Yet'}
                </span>
              </p>
            </div>

            {session.isActive ? (
              <a
                href={session.zoomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
              >
                Join Google Meet
              </a>
            ) : (
              <button
                disabled
                className="mt-3 sm:mt-0 bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
              >
                Link not active yet
              </button>
            )}
          </div>
        ))}
      </div>

      {/* --- Past Sessions --- */}
      {pastSessions.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Past Sessions</h3>

          <div className="space-y-4">
            {pastSessions.map(session => (
              <div
                key={session.id}
                className="bg-gray-100 p-4 rounded shadow-sm border border-gray-200"
              >
                <h3 className="font-semibold text-lg text-gray-700">{session.title}</h3>
                {session.description && <p className="text-gray-600">{session.description}</p>}
                <p className="text-gray-500 text-sm">
                  {session.date instanceof Timestamp
                    ? session.date.toDate().toLocaleString()
                    : new Date(session.date).toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 mt-1 italic">Session completed ✅</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
