'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json() as { success?: boolean; error?: string };

      if (data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F3ED] px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#541409] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#EAD6D6]">B</span>
            </div>
            <h1 className="text-2xl font-bold text-[#541409]">Admin Login</h1>
            <p className="text-[#541409]/60 mt-2">Bakes by Coral Dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#541409] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-[#EAD6D6] focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none transition-colors text-[#541409] placeholder:text-[#541409]/50"
                placeholder="coral@bakesbycoral.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#541409] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-[#EAD6D6] focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none transition-colors text-[#541409] placeholder:text-[#541409]/50"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#541409] hover:opacity-90 disabled:opacity-50 text-[#EAD6D6] font-semibold py-3 px-4 rounded-lg transition-opacity"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#541409]/60 text-sm mt-6">
          <Link href="/" className="hover:text-[#541409]">
            &larr; Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
