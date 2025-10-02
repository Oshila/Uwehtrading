'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-md w-full bg-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
          >
            Send Reset Email
          </button>
        </form>
        {message && <p className="mt-4 text-green-400">{message}</p>}
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>
    </div>
  );
}
