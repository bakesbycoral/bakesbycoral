'use client';

import { useState, useEffect } from 'react';

interface BlackoutDate {
  id: string;
  date: string;
  reason: string | null;
  created_at: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BlockedDates() {
  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');

  // Fetch blackout dates on mount
  useEffect(() => {
    fetchBlackoutDates();
  }, []);

  const fetchBlackoutDates = async () => {
    try {
      const response = await fetch('/api/admin/blackout');
      const data = await response.json();
      if (data.blackoutDates) {
        // Filter to only show future dates
        const today = new Date().toISOString().split('T')[0];
        const futureDates = data.blackoutDates.filter(
          (d: BlackoutDate) => d.date >= today
        );
        setBlackoutDates(futureDates);
      }
    } catch (err) {
      console.error('Failed to fetch blackout dates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDate = async () => {
    if (!newDate) {
      setError('Please select a date');
      return;
    }

    // Check if date is in the past
    const today = new Date().toISOString().split('T')[0];
    if (newDate < today) {
      setError('Cannot block dates in the past');
      return;
    }

    setIsAdding(true);
    setError('');

    try {
      const response = await fetch('/api/admin/blackout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, reason: newReason || null }),
      });

      const data = await response.json();

      if (data.success) {
        setNewDate('');
        setNewReason('');
        fetchBlackoutDates();
      } else {
        setError(data.error || 'Failed to add blocked date');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveDate = async (date: string) => {
    try {
      const response = await fetch(`/api/admin/blackout?date=${date}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchBlackoutDates();
      }
    } catch (err) {
      console.error('Failed to remove date:', err);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
      <h2 className="text-lg font-semibold text-[#541409] mb-2">Blocked Days</h2>
      <p className="text-sm text-[#541409]/60 mb-6">
        Block off days when you cannot take orders (vacation, holidays, etc.)
      </p>

      {/* Add new blocked date */}
      <div className="mb-6 p-4 bg-[#EAD6D6]/20 rounded-lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">Reason (optional)</label>
            <input
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="e.g., Vacation, Holiday"
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}

        <button
          onClick={handleAddDate}
          disabled={isAdding || !newDate}
          className="mt-4 px-4 py-2 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity text-sm font-medium"
        >
          {isAdding ? 'Adding...' : 'Block This Day'}
        </button>
      </div>

      {/* List of blocked dates */}
      <div>
        <h3 className="text-sm font-medium text-[#541409]/70 mb-3">Upcoming Blocked Days</h3>

        {isLoading ? (
          <p className="text-sm text-[#541409]/60 py-4 text-center">Loading...</p>
        ) : blackoutDates.length === 0 ? (
          <p className="text-sm text-[#541409]/60 py-4 text-center">
            No blocked days scheduled. All days are available for orders.
          </p>
        ) : (
          <div className="space-y-2">
            {blackoutDates.map((blackout) => (
              <div
                key={blackout.id}
                className="flex items-center justify-between p-3 bg-[#F7F3ED] rounded-lg"
              >
                <div>
                  <div className="font-medium text-[#541409]">
                    {formatDate(blackout.date)}
                  </div>
                  {blackout.reason && (
                    <div className="text-sm text-[#541409]/60">{blackout.reason}</div>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveDate(blackout.date)}
                  className="p-2 text-[#541409]/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove blocked day"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
