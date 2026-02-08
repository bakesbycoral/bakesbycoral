'use client';

import { useState } from 'react';

interface NewsletterSignupProps {
  variant?: 'inline' | 'section';
  title?: string;
  description?: string;
}

export function NewsletterSignup({
  variant = 'inline',
  title = 'Stay in the Loop',
  description = 'Get practical tips on lean methodology, operational excellence, and continuous improvement delivered to your inbox.',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          tenantId: 'leango',
          source: 'website',
        }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (variant === 'section') {
    return (
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#00a1f1]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[#66d200]/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00a1f1]/10 border border-[#00a1f1]/20 mb-6">
            <svg className="w-5 h-5 text-[#00a1f1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-[#00a1f1]">Newsletter</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-white">{title}</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">{description}</p>

          {status === 'success' ? (
            <div className="mt-8 bg-[#66d200]/10 border border-[#66d200]/20 rounded-2xl p-6 max-w-md mx-auto">
              <svg className="w-12 h-12 text-[#66d200] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-[#66d200] font-medium">You&apos;re subscribed!</p>
              <p className="text-gray-400 text-sm mt-1">Check your inbox for a confirmation email.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="leango-input flex-1 px-5 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-[#00a1f1] focus:border-[#00a1f1] transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-8 py-4 bg-[#00a1f1] text-white font-semibold rounded-xl hover:bg-[#0091d8] hover:shadow-lg hover:shadow-[#00a1f1]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {status === 'error' && (
                <p className="mt-3 text-red-400 text-sm">Something went wrong. Please try again.</p>
              )}
              <p className="mt-4 text-xs text-gray-500">
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Inline variant (for footer)
  return (
    <div>
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-400">
        {description}
      </p>

      {status === 'success' ? (
        <div className="mt-4 flex items-center gap-2 text-[#66d200]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm">You&apos;re subscribed!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              className="leango-input flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-[#00a1f1] focus:border-[#00a1f1] transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-4 py-2.5 bg-[#00a1f1] text-white text-sm font-medium rounded-lg hover:bg-[#0091d8] transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? '...' : 'Join'}
            </button>
          </div>
          {status === 'error' && (
            <p className="mt-2 text-red-400 text-xs">Something went wrong.</p>
          )}
        </form>
      )}
    </div>
  );
}
