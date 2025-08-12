'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'

interface UserRequest {
  id: string
  userId: string
  userEmail: string
  planId: string
  planName: string
  paymentStatus: string
  status: string
  expertId?: string | null
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

interface Expert {
  id: string
  name: string
  email: string
}

interface User {
  uid: string
  email: string
  name?: string
}

export default function ManagementAdmin() {
  const [requests, setRequests] = useState<UserRequest[]>([])
  const [experts, setExperts] = useState<Expert[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [manualModalOpen, setManualModalOpen] = useState(false)

  const [assignRequestId, setAssignRequestId] = useState<string | null>(null)
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null)

  const [manualUserId, setManualUserId] = useState<string | null>(null)
  const [manualPlanId, setManualPlanId] = useState<string | null>(null)

  const plans = [
    { id: 'lite', name: 'Lite Phase' },
    { id: 'pro', name: 'Pro Phase' },
    { id: 'geant', name: 'Geant Phase' },
    { id: 'grande', name: 'Grande Phase' },
  ]

  // Fetch all requests
  async function fetchRequests() {
    setLoading(true)
    setError(null)
    try {
      const q = query(collection(firestore, 'account_management_requests'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      const data: UserRequest[] = snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<UserRequest, 'id'>),
      }))
      setRequests(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  // Fetch experts
  async function fetchExperts() {
    try {
      const snap = await getDocs(collection(firestore, 'experts'))
      const data: Expert[] = snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Expert, 'id'>),
      }))
      setExperts(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load experts')
    }
  }

  // Fetch users
  async function fetchUsers() {
    try {
      const snap = await getDocs(collection(firestore, 'users'))
      const data: User[] = snap.docs.map(doc => ({
        uid: doc.id,
        ...(doc.data() as Omit<User, 'uid'>),
      }))
      setUsers(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load users')
    }
  }

  useEffect(() => {
    fetchRequests()
    fetchExperts()
    fetchUsers()
  }, [])

  // Assign modal handlers
  function openAssignModal(requestId: string) {
    setAssignRequestId(requestId)
    setSelectedExpertId(null)
    setAssignModalOpen(true)
  }
  function closeAssignModal() {
    setAssignModalOpen(false)
  }

  // Manual modal handlers
  function openManualModal() {
    setManualUserId(null)
    setManualPlanId(null)
    setManualModalOpen(true)
  }
  function closeManualModal() {
    setManualModalOpen(false)
  }

  // Assign expert to a request
  async function assignExpert() {
    if (!assignRequestId || !selectedExpertId) {
      alert('Select an expert first')
      return
    }
    setProcessing(true)
    setError(null)
    try {
      const reqRef = doc(firestore, 'account_management_requests', assignRequestId)
      await updateDoc(reqRef, {
        expertId: selectedExpertId,
        status: 'assigned',
        updatedAt: new Date(),
      })
      await fetchRequests()
      alert('Expert assigned successfully')
      closeAssignModal()
    } catch (err) {
      console.error(err)
      setError('Failed to assign expert')
    } finally {
      setProcessing(false)
    }
  }

  // Update request status (active, completed, cancelled)
  async function updateRequestStatus(requestId: string, status: string) {
    setProcessing(true)
    setError(null)
    try {
      const reqRef = doc(firestore, 'account_management_requests', requestId)
      await updateDoc(reqRef, {
        status,
        updatedAt: new Date(),
      })
      await fetchRequests()
    } catch (err) {
      console.error(err)
      setError('Failed to update status')
    } finally {
      setProcessing(false)
    }
  }

  // Delete a request
  async function handleDeleteRequest(requestId: string) {
    const confirmed = confirm('Are you sure you want to delete this request? This action cannot be undone.')
    if (!confirmed) return

    setProcessing(true)
    setError(null)
    try {
      const reqRef = doc(firestore, 'account_management_requests', requestId)
      await deleteDoc(reqRef)
      await fetchRequests()
      alert('Request deleted successfully.')
    } catch (err) {
      console.error(err)
      setError('Failed to delete request.')
    } finally {
      setProcessing(false)
    }
  }

  // Manual plan assignment (create a request)
  async function createManualRequest() {
    if (!manualUserId || !manualPlanId) {
      alert('Select user and plan first')
      return
    }
    setProcessing(true)
    setError(null)
    try {
      await addDoc(collection(firestore, 'account_management_requests'), {
        userId: manualUserId,
        userEmail: users.find(u => u.uid === manualUserId)?.email ?? '',
        planId: manualPlanId,
        planName: plans.find(p => p.id === manualPlanId)?.name ?? '',
        paymentStatus: 'active',  // <--- Changed here
        status: 'assigned',
        expertId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await fetchRequests()
      alert('Manual plan assigned successfully')
      closeManualModal()
    } catch (err) {
      console.error(err)
      setError('Failed to assign manual plan')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <nav className="bg-black text-white px-6 py-3 flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl font-semibold">Account Management Admin</h1>
        <button
          onClick={openManualModal}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          disabled={processing}
          aria-label="Assign plan manually"
        >
          Manual Plan Assignment
        </button>
      </nav>

      <main className="max-w-7xl mx-auto mt-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Loading requests...</p>
        ) : (
          <div className="overflow-x-auto border rounded shadow-sm bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">Request ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">User Email</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">Plan</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">Payment Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">Request Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">Expert</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">Created At</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-6 text-gray-500 italic">
                      No requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="p-2 border border-gray-300 text-xs break-all">{r.id}</td>
                      <td className="p-2 border border-gray-300 text-sm">{r.userEmail}</td>
                      <td className="p-2 border border-gray-300 text-sm">{r.planName}</td>
                      <td className="p-2 border border-gray-300 text-sm capitalize">{r.paymentStatus}</td>
                      <td className="p-2 border border-gray-300 text-sm capitalize">{r.status}</td>
                      <td className="p-2 border border-gray-300 text-sm break-all">{r.expertId ?? 'None'}</td>
                      <td className="p-2 border border-gray-300 text-xs whitespace-nowrap">
                        {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-2 border border-gray-300 space-y-1 flex flex-col items-center">
                        <button
                          onClick={() => openAssignModal(r.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                          disabled={processing}
                        >
                          Assign Expert
                        </button>

                        {r.status !== 'active' && (
                          <button
                            onClick={() => updateRequestStatus(r.id, 'active')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                            disabled={processing}
                          >
                            Mark Active
                          </button>
                        )}

                        {r.status !== 'completed' && (
                          <button
                            onClick={() => updateRequestStatus(r.id, 'completed')}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded"
                            disabled={processing}
                          >
                            Mark Completed
                          </button>
                        )}

                        {r.status !== 'cancelled' && (
                          <button
                            onClick={() => updateRequestStatus(r.id, 'cancelled')}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                            disabled={processing}
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteRequest(r.id)}
                          className="w-full bg-red-800 hover:bg-red-900 text-white px-2 py-1 rounded mt-1"
                          disabled={processing}
                        >
                          Delete Request
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Assign Expert Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Assign Expert</h2>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              value={selectedExpertId ?? ''}
              onChange={e => setSelectedExpertId(e.target.value || null)}
              disabled={processing}
              aria-label="Select expert to assign"
            >
              <option value="">-- Select Expert --</option>
              {experts.map(exp => (
                <option key={exp.id} value={exp.id}>
                  {exp.name} ({exp.email})
                </option>
              ))}
            </select>

            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                onClick={closeAssignModal}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={assignExpert}
                disabled={processing || !selectedExpertId}
              >
                {processing ? 'Assigning...' : 'Assign Expert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Assign Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Manual Plan Assignment</h2>

            <label className="block mb-2 font-medium" htmlFor="manualUserSelect">
              Select User
            </label>
            <select
              id="manualUserSelect"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              value={manualUserId ?? ''}
              onChange={e => setManualUserId(e.target.value || null)}
              disabled={processing}
            >
              <option value="">-- Select User --</option>
              {users.map(user => (
                <option key={user.uid} value={user.uid}>
                  {user.email} {user.name ? `(${user.name})` : ''}
                </option>
              ))}
            </select>

            <label className="block mb-2 font-medium" htmlFor="manualPlanSelect">
              Select Plan
            </label>
            <select
              id="manualPlanSelect"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
              value={manualPlanId ?? ''}
              onChange={e => setManualPlanId(e.target.value || null)}
              disabled={processing}
            >
              <option value="">-- Select Plan --</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                onClick={closeManualModal}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={createManualRequest}
                disabled={processing || !manualUserId || !manualPlanId}
              >
                {processing ? 'Assigning...' : 'Assign Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
