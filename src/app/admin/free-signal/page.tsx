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
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'

type FreeSignal = {
  id: string
  text: string
  senderUid: string
  senderRole: string
  timestamp: Timestamp | Date
}

export default function AdminFreeSignal() {
  const [signals, setSignals] = useState<FreeSignal[]>([])
  const [newSignal, setNewSignal] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [loading, setLoading] = useState(true)

  // Fetch signals and availability
  const fetchSignals = async () => {
    setLoading(true)
    try {
      // Fetch signals
      const signalsRef = collection(firestore, 'free_signals')
      const q = query(signalsRef, orderBy('timestamp', 'asc'))
      const snapshot = await getDocs(q)

      const fetchedSignals: FreeSignal[] = snapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text,
        senderUid: doc.data().senderUid,
        senderRole: doc.data().senderRole,
        timestamp: doc.data().timestamp,
      }))
      setSignals(fetchedSignals)

      // Fetch availability
      const configRef = doc(firestore, 'config', 'free_signals')
      const configSnap = await getDoc(configRef)
      if (configSnap.exists()) {
        setIsAvailable(configSnap.data()?.isAvailable ?? true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignals()
  }, [])

  const handleAddSignal = async () => {
    if (!newSignal.trim()) return
    try {
      await addDoc(collection(firestore, 'free_signals'), {
        text: newSignal,
        senderUid: 'admin',
        senderRole: 'admin',
        timestamp: new Date(),
      })
      setNewSignal('')
      fetchSignals()
    } catch (err) {
      console.error('Error adding signal:', err)
    }
  }

  const toggleAvailability = async () => {
    try {
      const configRef = doc(firestore, 'config', 'free_signals')
      await updateDoc(configRef, { isAvailable: !isAvailable })
      setIsAvailable(!isAvailable)
    } catch (err) {
      console.error('Error toggling availability:', err)
    }
  }

  const handleDeleteSignal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this signal?')) return
    try {
      await deleteDoc(doc(firestore, 'free_signals', id))
      fetchSignals()
    } catch (err) {
      console.error('Error deleting signal:', err)
    }
  }

  if (loading) return <p className="text-center mt-6">Loading...</p>

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Free Signal Room</h1>

      <button
        onClick={toggleAvailability}
        className={`mb-6 px-4 py-2 rounded ${
          isAvailable ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
        } text-white transition`}
      >
        {isAvailable ? 'Disable Free Signals' : 'Enable Free Signals'}
      </button>

      <div className="mb-6 flex gap-3">
        <input
          type="text"
          value={newSignal}
          onChange={e => setNewSignal(e.target.value)}
          placeholder="Enter new free signal"
          className="flex-grow border rounded px-3 py-2"
        />
        <button
          onClick={handleAddSignal}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
        >
          Add Signal
        </button>
      </div>

      <div className="space-y-3">
        {signals.length === 0 && <p className="text-gray-500">No free signals yet.</p>}
        {signals.map(signal => (
          <div
            key={signal.id}
            className="bg-gray-100 p-4 rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <p>{signal.text}</p>
              <small className="text-gray-500">
                {signal.timestamp instanceof Timestamp
                  ? signal.timestamp.toDate().toLocaleString()
                  : new Date(signal.timestamp).toLocaleString()}
              </small>
            </div>
            <button
              onClick={() => handleDeleteSignal(signal.id)}
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
