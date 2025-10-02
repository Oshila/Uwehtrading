'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { auth, firestore } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import Navbar from '@/components/Navbar'
import { doc, getDoc } from 'firebase/firestore'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [hasPlan, setHasPlan] = useState(false)
  const [freeSignalsAvailable, setFreeSignalsAvailable] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        try {
          // check plan expiry
          const userRef = doc(firestore, 'users', currentUser.uid)
          const userSnap = await getDoc(userRef)
          if (userSnap.exists()) {
            const userData = userSnap.data()
            const expiry =
              userData.planExpiry?.toDate?.() ||
              new Date(userData.planExpiry)
            if (expiry && new Date() < new Date(expiry)) {
              setHasPlan(true)
            }
          }

          // check free signal availability
          const configRef = doc(firestore, 'config', 'free_signals')
          const configSnap = await getDoc(configRef)
          if (configSnap.exists()) {
            setFreeSignalsAvailable(configSnap.data().available === true)
          }
        } catch (err) {
          console.error('Error fetching dashboard data:', err)
        }
      }
    })

    return unsubscribe
  }, [])

  if (!user) return <p className="p-4">Loading user info...</p>

  return (
    <>
      <Navbar hasPlan={hasPlan} />

      <main className="max-w-4xl mx-auto p-6 mt-20">
        <p className="mb-4 text-gray-600 text-lg">
          Welcome back, <span className="font-semibold">{user.displayName || 'Trader'}</span>!
        </p>

        <h1 className="text-3xl font-semibold mb-8">Dashboard</h1>

        {/* Personal Info */}
        <section className="mb-8 p-6 border rounded shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Personal Info</h2>
          <p className="mb-4 text-gray-700">Edit your username, email, and other personal details.</p>
          <div className="mb-2"><span className="font-medium">Username:</span> {user.displayName || 'Not set'}</div>
          <div className="mb-4"><span className="font-medium">Email:</span> {user.email}</div>
          <Link href="/account-settings" className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">Account Settings</Link>
        </section>

        {/* Account Management */}
        <section className="mb-8 p-6 border rounded shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Account Management</h2>
          <p className="mb-4 text-gray-700">
            Request professional account management or view your current plan & status.
          </p>
          <Link
            href="/account-management"
            className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Go to Account Management
          </Link>
        </section>

        {/* Pricing & Services */}
        <section className="mb-8 p-6 border rounded shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Pricing & Services</h2>
          <p className="mb-4 text-gray-700">View our available services and pricing plans.</p>
          <Link href="/plans" className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">Services & Pricing</Link>
        </section>

        {/* Billing History */}
        <section className="mb-8 p-6 border rounded shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Billing History</h2>
          <p className="mb-4 text-gray-700">Check out all your payment history and invoices.</p>
          <Link href="/transactions" className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">Payment History</Link>
        </section>

        {/* Subscriptions */}
        <section className="mb-8 p-6 border rounded shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Subscriptions</h2>
          <p className="mb-4 text-gray-700">Create and manage your active subscriptions.</p>
          <Link href="/subscription" className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">Manage Subscriptions</Link>
        </section>

        {/* Free Signal Room */}
        <section className="mb-8 p-6 border rounded shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Free Signal Room</h2>
          {freeSignalsAvailable ? (
            <>
              <p className="mb-4 text-gray-700">Access free trading signals available this year.</p>
              <Link href="/free-signals" className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-white-700 transition">Enter Free Signal Room</Link>
            </>
          ) : (
            <p className="text-gray-500 italic">Currently unavailable. Please check back later.</p>
          )}
        </section>

        {/* Free Mentorship */}
        <section className="mb-8 p-6 border rounded shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Free Mentorship</h2>
          <p className="mb-4 text-gray-700">Join live mentorship sessions hosted on Zoom.</p>
          <Link href="/free-mentorship" className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-white-100 transition">Join Mentorship</Link>
        </section>

        {/* Paid Signal Room */}
        {hasPlan && (
          <section className="mb-8 p-6 border rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-2">VIP Signal Room</h2>
            <p className="mb-4 text-gray-700">Access premium signals posted by the admin team.</p>
            <Link href="/signals" className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-700 transition">Enter Signal Room</Link>
          </section>
        )}
      </main>
    </>
  )
}
