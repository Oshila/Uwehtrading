'use client'

import { useEffect, useState } from 'react'
import { firestore, auth } from '@/lib/firebase'
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'

type UserRole = 'user' | 'admin' | 'expert'

interface User {
  uid: string
  email: string
  name?: string
  role?: UserRole
  plan?: string
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      const usersRef = collection(firestore, 'users')
      const usersSnapshot = await getDocs(usersRef)
      const usersData: User[] = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...(doc.data() as Omit<User, 'uid'>),
      }))
      setUsers(usersData)
    } catch (err) {
      console.error(err)
      setError('Failed to load users')
    }
  }

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false))
  }, [])

  const changeUserRole = async (uid: string, newRole: UserRole, user?: User) => {
    try {
      const userDocRef = doc(firestore, 'users', uid)
      await updateDoc(userDocRef, { role: newRole })

      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
      )

      alert(`User role updated to ${newRole}`)

      // If promoting to expert, add to experts collection
      if (newRole === 'expert' && user) {
        const expertDocRef = doc(firestore, 'experts', uid)
        await setDoc(expertDocRef, {
          name: user.name || '',
          email: user.email,
          userId: uid,
          createdAt: serverTimestamp(),
        })
      }

      // If demoting from expert, remove from experts collection
      if (newRole !== 'expert') {
        const expertDocRef = doc(firestore, 'experts', uid)
        await deleteDoc(expertDocRef).catch(() => {})
      }
    } catch (err) {
      console.error(err)
      alert('Failed to update user role')
    }
  }

  const handleDeleteUser = async (uid: string, role?: UserRole) => {
    if (auth.currentUser?.uid === uid) {
      alert("You cannot delete yourself!")
      return
    }

    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await deleteDoc(doc(firestore, 'users', uid))

      if (role === 'expert') {
        await deleteDoc(doc(firestore, 'experts', uid)).catch(() => {})
      }

      setUsers(prev => prev.filter(user => user.uid !== uid))

      alert('User deleted successfully')
    } catch (err) {
      console.error(err)
      alert('Failed to delete user')
    }
  }

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-600 text-lg">Loading users...</p>
    )
  if (error)
    return (
      <p className="text-center mt-20 text-red-600 font-semibold">{error}</p>
    )

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Users Management</h1>
      <table className="w-full border border-gray-300 rounded shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 border border-gray-300">UID</th>
            <th className="p-3 border border-gray-300">Name</th>
            <th className="p-3 border border-gray-300">Email</th>
            <th className="p-3 border border-gray-300">Role</th>
            <th className="p-3 border border-gray-300">Plan</th>
            <th className="p-3 border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center p-4 text-gray-500 italic">
                No users found.
              </td>
            </tr>
          )}
          {users.map((user) => (
            <tr key={user.uid} className="hover:bg-gray-50">
              <td className="p-2 border border-gray-300 text-sm break-all">{user.uid}</td>
              <td className="p-2 border border-gray-300">{user.name ?? 'N/A'}</td>
              <td className="p-2 border border-gray-300">{user.email}</td>
              <td className="p-2 border border-gray-300 capitalize">{user.role ?? 'user'}</td>
              <td className="p-2 border border-gray-300">{user.plan ?? 'None'}</td>
              <td className="p-2 border border-gray-300 space-x-2">
                {user.role === 'admin' ? (
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => changeUserRole(user.uid, 'user', user)}
                  >
                    Demote to User
                  </button>
                ) : user.role === 'expert' ? (
                  <button
                    className="px-3 py-1 bg-red-700 text-white rounded hover:bg-red-800"
                    onClick={() => changeUserRole(user.uid, 'user', user)}
                  >
                    Demote from Expert
                  </button>
                ) : (
                  <>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => changeUserRole(user.uid, 'admin', user)}
                    >
                      Promote to Admin
                    </button>
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
                      onClick={() => changeUserRole(user.uid, 'expert', user)}
                    >
                      Promote to Expert
                    </button>
                  </>
                )}

                <button
                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 ml-2"
                  onClick={() => handleDeleteUser(user.uid, user.role)}
                >
                  Delete User
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
