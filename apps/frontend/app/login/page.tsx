'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-gray-900">Welcome Back</h1>
        <p className="text-xs text-gray-500">Log in to your BlinkClone account</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 text-xs font-bold p-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-gray-700 font-bold mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 font-medium focus:outline-none focus:border-blinkit-green"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 font-medium focus:outline-none focus:border-blinkit-green"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blinkit-green hover:bg-blinkit-darkGreen text-white py-3.5 rounded-xl font-black text-sm transition shadow-lg active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="text-center text-xs text-gray-500">
        Don't have an account?{' '}
        <Link href="/signup" className="font-bold text-blinkit-green hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
