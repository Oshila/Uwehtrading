'use client'

import { useEffect, useState } from 'react'
import { firestore } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import Link from 'next/link'

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [totalPayments, setTotalPayments] = useState<number>(0)
  const [successfulPayments, setSuccessfulPayments] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const usersSnapshot = await getDocs(collection(firestore, 'users'))
        setTotalUsers(usersSnapshot.size)

        const paymentsSnapshot = await getDocs(collection(firestore, 'payments'))
        setTotalPayments(paymentsSnapshot.size)

        const successQuery = query(
          collection(firestore, 'payments'),
          where('status', '==', 'success')
        )
        const successSnapshot = await getDocs(successQuery)
        setSuccessfulPayments(successSnapshot.size)
      } catch (err) {
        console.error(err)
        setError('Failed to load dashboard stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <p className="text-gray-500 text-lg animate-pulse text-center">
          Loading dashboard...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <p className="text-red-600 font-semibold text-lg text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full px-4 md:px-8 max-w-7xl mx-auto py-10">
      <h1 className="text-3xl md:text-5xl font-extrabold mb-12 text-center text-gray-900">
        Admin Dashboard
      </h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {/* Users */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-6 flex flex-col items-center text-center border border-gray-100">
          <div className="bg-blue-100 p-5 rounded-full mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9.004 9.004 0 0112 15a9.004 9.004 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Total Users</h2>
          <p className="text-4xl font-bold text-blue-600 mt-2">{totalUsers}</p>
          <Link href="/admin/users" className="mt-6 inline-block px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md transition">
            Manage Users
          </Link>
        </div>

        {/* Payments */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-6 flex flex-col items-center text-center border border-gray-100">
          <div className="bg-green-100 p-5 rounded-full mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a4 4 0 00-8 0v2M5 13h14l-1 7H6l-1-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Total Payments</h2>
          <p className="text-4xl font-bold text-green-600 mt-2">{totalPayments}</p>
          <Link href="/admin/payments" className="mt-6 inline-block px-6 py-3 rounded-full bg-green-600 text-white hover:bg-green-700 shadow-md transition">
            Manage Payments
          </Link>
        </div>

        {/* Successful Payments */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-6 flex flex-col items-center text-center border border-gray-100">
          <div className="bg-purple-100 p-5 rounded-full mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Successful Payments</h2>
          <p className="text-4xl font-bold text-purple-600 mt-2">{successfulPayments}</p>
          <Link href="/admin/payments?filter=success" className="mt-6 inline-block px-6 py-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 shadow-md transition">
            Manage Success
          </Link>
        </div>
      </div>

{/* Quick Links Section */}
<h2 className="text-2xl font-bold mb-6 text-gray-800">Quick Links</h2>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
  {[
    { href: '/admin/assignPlan', label: 'Assign Plans', color: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
    { href: '/admin/signals', label: 'Signal Room', color: 'bg-indigo-500', hover: 'hover:bg-indigo-600' },
    { href: '/admin/free-signal', label: 'Free Signal Room', color: 'bg-pink-500', hover: 'hover:bg-pink-600' },
    { href: '/admin/free-mentorship', label: 'Free Mentorship', color: 'bg-orange-500', hover: 'hover:bg-orange-600' }, // new card
    { href: '/admin/accountManagement', label: 'Account Management', color: 'bg-teal-500', hover: 'hover:bg-teal-600' },
    { href: '/admin/profile', label: 'Profile', color: 'bg-gray-700', hover: 'hover:bg-gray-800' },
    { href: '/admin-login', label: 'Logout', color: 'bg-red-500', hover: 'hover:bg-red-600' },
  ].map((link, idx) => (
    <Link key={idx} href={link.href}>
      <div className={`${link.color} ${link.hover} cursor-pointer rounded-xl p-6 shadow-lg transition duration-300 flex flex-col items-center text-white text-center`}>
        <h2 className="text-lg font-semibold">{link.label}</h2>
        <p className="text-sm mt-1 opacity-80">Go to {link.label}</p>
      </div>
    </Link>
  ))}
</div>

    </div>
  )
}
