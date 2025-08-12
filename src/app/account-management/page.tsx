'use client'

import { useState, useEffect, useRef } from 'react'
import { auth, firestore } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDoc,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'

type PlanId = 'lite' | 'pro' | 'geant' | 'grande'

type Plan = {
  id: PlanId
  name: string
  description: string
  features: string[]
  price: string
}

const PLANS: Plan[] = [
  { id: 'lite', name: 'Lite Plan', description: 'Basic account management', features: ['Email support', 'Monthly reports'], price: '$50/One-time Payment' },
  { id: 'pro', name: 'Pro Plan', description: 'Advanced account management', features: ['Priority support', 'Weekly reports', 'Dedicated assistant'], price: '$100/One-time Payment' },
  { id: 'geant', name: 'Geant Plan', description: 'Advanced account management', features: ['Priority support', 'Weekly reports', 'Dedicated assistant'], price: '$300/One-time Payment' },
  { id: 'grande', name: 'Grande Plan', description: 'Advanced account management', features: ['Priority support', 'Weekly reports', 'Dedicated assistant'], price: 'contact!!' },
]

type UserRequest = {
  id: string
  userId: string
  userEmail: string
  planId: PlanId
  planName: string
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed'
  expertId?: string | null
  expertName?: string | null
  expertEmail?: string | null
  createdAt?: any
}

type Message = {
  id: string
  text: string
  senderId: string
  senderRole: 'user' | 'expert' | 'admin'
  timestamp?: any
  requestId?: string
}

type Expert = {
  id: string
  name: string
  email: string
}

export default function AccountDashboard() {
  // keep auth as state so effects run when user signs in/out
  const [currentUser, setCurrentUser] = useState<typeof auth.currentUser | null>(null)
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setCurrentUser(u))
    return () => unsub()
  }, [])

  const [isExpert, setIsExpert] = useState(false)
  const [loadingUserType, setLoadingUserType] = useState(true)

  const [latestRequest, setLatestRequest] = useState<UserRequest | null>(null)
  const [assignedExpert, setAssignedExpert] = useState<Expert | null>(null)
  const [loadingRequest, setLoadingRequest] = useState(true)

  const [assignedRequests, setAssignedRequests] = useState<UserRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // detect expert role (reads /experts/{uid} — note: rules allow only expert or admin to read this)
  useEffect(() => {
    if (!currentUser) return
    let mounted = true
    setLoadingUserType(true)
    ;(async () => {
      try {
        const expertRef = doc(firestore, 'experts', currentUser.uid)
        const expertSnap = await getDoc(expertRef)
        if (!mounted) return
        setIsExpert(expertSnap.exists())
      } catch (err) {
        console.error('Error checking expert status', err)
        setIsExpert(false)
      } finally {
        if (mounted) setLoadingUserType(false)
      }
    })()
    return () => { mounted = false }
  }, [currentUser])

  // ---------- USER: latest request (1) ----------
  useEffect(() => {
    if (!currentUser || isExpert) return
    setLoadingRequest(true)

    const q = query(
      collection(firestore, 'account_management_requests'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    )

    const unsubscribe = onSnapshot(q, async snap => {
      try {
        if (!snap.empty) {
          const d = snap.docs[0]
          const req = { id: d.id, ...(d.data() as Omit<UserRequest, 'id'>) }
          // Prefer expertName/expertEmail that admin should write to request doc.
          if (req.expertName && req.expertEmail) {
            setAssignedExpert({ id: req.expertId ?? '', name: req.expertName, email: req.expertEmail })
          } else if (req.expertId) {
            // if expert info is not stored in request doc, attempt to fetch experts doc,
            // but that may fail due to rules: wrap in try/catch to avoid blowing up snapshot callback.
            try {
              const expertSnap = await getDoc(doc(firestore, 'experts', req.expertId));
if (expertSnap.exists()) {
  const expertData = expertSnap.data() as Expert;
  setAssignedExpert({
    ...expertData,
    id: expertSnap.id // put id last so it overrides if needed
  });
}

              else setAssignedExpert(null)
            } catch (err) {
              // permission denied or other error — don't crash, just leave assignedExpert null
              console.warn('Cannot read experts doc (likely permissions):', err)
              setAssignedExpert(null)
            }
          } else {
            setAssignedExpert(null)
          }
          setLatestRequest(req)
        } else {
          setLatestRequest(null)
          setAssignedExpert(null)
        }
      } catch (err) {
        console.error('Latest request processing error:', err)
        setError('Failed to load request')
      } finally {
        setLoadingRequest(false)
      }
    }, (err) => {
      console.error('Request snapshot failed', err)
      setError('Failed to load request')
      setLoadingRequest(false)
    })

    return () => unsubscribe()
  }, [currentUser, isExpert])

  // ---------- EXPERT: load assigned requests ----------
  useEffect(() => {
    if (!currentUser || !isExpert) return

    const q = query(
      collection(firestore, 'account_management_requests'),
      where('expertId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<UserRequest, 'id'>) }))
      setAssignedRequests(list)
    }, err => {
      console.error('Assigned requests snapshot error', err)
      setError('Failed to load assigned requests')
    })

    return () => unsubscribe()
  }, [currentUser, isExpert])

  // ---------- MESSAGES listener ----------
  useEffect(() => {
    const chatId = isExpert ? selectedRequest?.id : latestRequest?.id
    if (!chatId || !currentUser) {
      setMessages([])
      return
    }

    const messagesCol = collection(firestore, 'account_management_requests', chatId, 'messages')
    const q = query(messagesCol, orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Message, 'id'>) }))
      setMessages(msgs)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }, err => {
      console.error('Message snapshot error', err)
      setError('Failed to load messages')
    })

    return () => unsubscribe()
  }, [isExpert, latestRequest?.id, selectedRequest?.id, currentUser])

  // ---------- send message ----------
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return
    const chatId = isExpert ? selectedRequest?.id : latestRequest?.id
    if (!chatId) { setError('No active chat'); return }
    try {
      setSendingMessage(true)
      const messagesCol = collection(firestore, 'account_management_requests', chatId, 'messages')
      await addDoc(messagesCol, {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        senderRole: isExpert ? 'expert' : 'user',
        timestamp: serverTimestamp(),
        requestId: chatId
      })
      setNewMessage('')
    } catch (err) {
      console.error('Send message failed', err)
      setError('Failed to send message')
    } finally { setSendingMessage(false) }
  }

  // ---------- submit plan request ----------
  const submitPlanRequest = async (planId: PlanId) => {
    if (!currentUser || isExpert) return
    setLoading(true)
    try {
      await addDoc(collection(firestore, 'account_management_requests'), {
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        planId,
        planName: PLANS.find(p => p.id === planId)?.name || '',
        status: 'pending',
        expertId: null,
        createdAt: serverTimestamp(),
      })
      setSuccessMessage('Plan request submitted for approval')
    } catch (err) {
      console.error('Submit plan request failed', err)
      setError('Failed to submit request')
    } finally { setLoading(false) }
  }

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Delete message?')) return
    const chatId = isExpert ? selectedRequest?.id : latestRequest?.id
    if (!chatId) return
    try {
      await deleteDoc(doc(firestore, 'account_management_requests', chatId, 'messages', messageId))
    } catch (err) {
      console.error('Delete message error', err)
      setError('Failed to delete message')
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ''
    try { return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } catch { return '' }
  }

  // ---------- UI ----------
  if (loadingUserType) return <div className="p-6">Loading...</div>
  if (!currentUser) return <div className="p-6">Please log in to continue</div>

  // Keep markup minimal-change from your original; below is the same layout adapted to use `assignedExpert` from request doc
  return (
    <div className="max-w-4xl mx-auto p-6">
      {isExpert ? (
        <div className="flex gap-6">
          <div className="w-1/3 border rounded p-4 bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Your Assignments</h2>
            {assignedRequests.length === 0 ? <p>No assigned requests</p> : (
              <ul className="space-y-2">
                {assignedRequests.map(req => (
                  <li key={req.id} onClick={() => setSelectedRequest(req)} className={`p-2 rounded cursor-pointer ${selectedRequest?.id === req.id ? 'bg-blue-100 font-medium' : 'hover:bg-gray-100'}`}>
                    <p className="font-medium">{req.userEmail}</p>
                    <p className="text-sm">{req.planName}</p>
                    <p className="text-xs text-gray-500 capitalize">{req.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex-1 border rounded p-4 bg-white">
            {selectedRequest ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Chat with {selectedRequest.userEmail}</h2>
                <div className="h-96 overflow-y-auto border rounded p-3 mb-3 bg-gray-50">
                  {messages.length === 0 ? <p className="text-gray-500">No messages yet</p> : messages.map(msg => (
                    <div key={msg.id} className={`mb-3 flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs p-3 rounded-lg ${msg.senderId === currentUser.uid ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="text-xs font-medium capitalize">{msg.senderRole}</span>
                          <span className="text-xs opacity-80">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p className="mt-1">{msg.text}</p>
                        {msg.senderId === currentUser.uid && <button onClick={() => deleteMessage(msg.id)} className="text-xs mt-1 opacity-70 hover:opacity-100 block w-full text-left" style={{ color: '#ffffffaa' }}>Delete</button>}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2">
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} className="flex-1 border rounded px-3 py-2" />
                  <button onClick={sendMessage} disabled={sendingMessage || !newMessage.trim()} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
                </div>
              </>
            ) : <p>Select a request to chat</p>}
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-6">Account Management Plans</h1>

          {loadingRequest ? <p>Loading your status...</p> : latestRequest ? (
            <div className="mb-6 p-4 border rounded bg-gray-50">
              <h2 className="text-lg font-semibold mb-2">Your Current Plan</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="font-medium">Plan:</p><p>{latestRequest.planName}</p></div>
                <div><p className="font-medium">Status:</p>
                  <span className={`px-2 py-1 text-xs rounded ${latestRequest.status === 'approved' ? 'bg-green-100 text-green-800' : latestRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : latestRequest.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{latestRequest.status}</span>
                </div>
                {assignedExpert && <>
                  <div><p className="font-medium">Assigned Expert:</p><p>{assignedExpert.name}</p></div>
                  <div><p className="font-medium">Contact:</p><p>{assignedExpert.email}</p></div>
                </>}
              </div>
            </div>
          ) : <p className="mb-6">You don't have any active requests</p>}

          {latestRequest?.status === 'active' && (
            <div className="mb-6 border rounded p-4 bg-white">
              <h2 className="text-lg font-semibold mb-3">Chat with Expert</h2>
              <div className="h-64 overflow-y-auto border rounded p-3 mb-3 bg-gray-50">
                {messages.length === 0 ? <p className="text-gray-500">No messages yet</p> : messages.map(msg => (
                  <div key={msg.id} className={`mb-3 flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-lg ${msg.senderId === currentUser.uid ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-xs font-medium capitalize">{msg.senderRole}</span>
                        <span className="text-xs opacity-80">{formatTime(msg.timestamp)}</span>
                      </div>
                      <p className="mt-1">{msg.text}</p>
                      {msg.senderId === currentUser.uid && <button onClick={() => deleteMessage(msg.id)} className="text-xs mt-1 opacity-70 hover:opacity-100 block w-full text-left" style={{ color: '#ffffffaa' }}>Delete</button>}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2">
                <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} className="flex-1 border rounded px-3 py-2" disabled={sendingMessage} />
                <button onClick={sendMessage} disabled={sendingMessage || !newMessage.trim()} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
              </div>
            </div>
          )}

          {(!latestRequest || ['rejected', 'completed'].includes(latestRequest.status)) && (
            <>
              <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PLANS.map(plan => (
                  <div key={plan.id} className="border rounded p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-1">{plan.description}</p>
                    <p className="font-medium text-blue-600 mb-3">{plan.price}</p>
                    <ul className="mb-4 space-y-1">{plan.features.map((f,i) => <li key={i} className="text-sm flex items-start"><span className="mr-1">✓</span>{f}</li>)}</ul>
                    <button onClick={() => submitPlanRequest(plan.id)} disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400">{loading ? 'Submitting...' : 'Request Plan'}</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {successMessage && <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">{successMessage}</div>}
    </div>
  )
}
