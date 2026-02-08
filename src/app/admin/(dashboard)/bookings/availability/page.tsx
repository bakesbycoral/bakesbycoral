'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AvailabilityWindow {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: number;
}

interface BookingType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  buffer_after_minutes: number;
  max_bookings_per_day: number | null;
  requires_approval: number;
  confirmation_message: string | null;
  is_active: number;
}

interface AvailabilityOverride {
  id: string;
  date: string;
  is_available: number;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const TIME_OPTIONS = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const time = `${hour.toString().padStart(2, '0')}:${minute}`;
  const label = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return { value: time, label };
});

export default function AvailabilityPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'types' | 'overrides'>('schedule');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Schedule state
  const [windows, setWindows] = useState<Record<number, { start_time: string; end_time: string; is_active: boolean }>>({});

  // Booking types state
  const [bookingTypes, setBookingTypes] = useState<BookingType[]>([]);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState<BookingType | null>(null);
  const [typeForm, setTypeForm] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    buffer_after_minutes: 15,
    max_bookings_per_day: '',
    requires_approval: false,
    confirmation_message: '',
    is_active: true,
  });

  // Overrides state
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([]);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    date: '',
    is_available: false,
    start_time: '09:00',
    end_time: '17:00',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [windowsRes, typesRes, overridesRes] = await Promise.all([
        fetch('/api/admin/availability'),
        fetch('/api/admin/booking-types'),
        fetch('/api/admin/availability-overrides'),
      ]);

      if (windowsRes.ok) {
        const data = await windowsRes.json() as { windows: AvailabilityWindow[] };
        const windowsMap: Record<number, { start_time: string; end_time: string; is_active: boolean }> = {};
        // Initialize all days
        DAYS_OF_WEEK.forEach(day => {
          windowsMap[day.value] = { start_time: '09:00', end_time: '17:00', is_active: false };
        });
        // Update with actual data
        (data.windows as AvailabilityWindow[]).forEach((w: AvailabilityWindow) => {
          windowsMap[w.day_of_week] = {
            start_time: w.start_time,
            end_time: w.end_time,
            is_active: w.is_active === 1,
          };
        });
        setWindows(windowsMap);
      }

      if (typesRes.ok) {
        const data = await typesRes.json() as { bookingTypes: BookingType[] };
        setBookingTypes(data.bookingTypes || []);
      }

      if (overridesRes.ok) {
        const data = await overridesRes.json() as { overrides: AvailabilityOverride[] };
        setOverrides(data.overrides || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSchedule() {
    setSaving(true);
    try {
      const windowsArray = Object.entries(windows).map(([day, config]) => ({
        day_of_week: parseInt(day),
        ...config,
      }));

      const response = await fetch('/api/admin/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windows: windowsArray }),
      });

      if (response.ok) {
        alert('Schedule saved successfully!');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleTypeSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const method = editingType ? 'PATCH' : 'POST';
      const body = editingType ? { ...typeForm, id: editingType.id, max_bookings_per_day: typeForm.max_bookings_per_day ? parseInt(typeForm.max_bookings_per_day) : null } : { ...typeForm, max_bookings_per_day: typeForm.max_bookings_per_day ? parseInt(typeForm.max_bookings_per_day) : null };

      const response = await fetch('/api/admin/booking-types', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowTypeModal(false);
        setEditingType(null);
        setTypeForm({
          name: '',
          description: '',
          duration_minutes: 30,
          buffer_after_minutes: 15,
          max_bookings_per_day: '',
          requires_approval: false,
          confirmation_message: '',
          is_active: true,
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error saving booking type:', error);
    }
  }

  async function deleteBookingType(id: string) {
    if (!confirm('Are you sure you want to delete this booking type?')) return;
    try {
      const response = await fetch(`/api/admin/booking-types?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchData();
      } else {
        const data = await response.json() as { error?: string };
        alert(data.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting booking type:', error);
    }
  }

  function openEditTypeModal(type: BookingType) {
    setEditingType(type);
    setTypeForm({
      name: type.name,
      description: type.description || '',
      duration_minutes: type.duration_minutes,
      buffer_after_minutes: type.buffer_after_minutes,
      max_bookings_per_day: type.max_bookings_per_day?.toString() || '',
      requires_approval: type.requires_approval === 1,
      confirmation_message: type.confirmation_message || '',
      is_active: type.is_active === 1,
    });
    setShowTypeModal(true);
  }

  async function handleOverrideSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/availability-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrideForm),
      });

      if (response.ok) {
        setShowOverrideModal(false);
        setOverrideForm({
          date: '',
          is_available: false,
          start_time: '09:00',
          end_time: '17:00',
          reason: '',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error saving override:', error);
    }
  }

  async function deleteOverride(id: string) {
    if (!confirm('Remove this date override?')) return;
    try {
      const response = await fetch(`/api/admin/availability-overrides?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting override:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-4">
            <Link href="/admin/bookings" className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Availability</h1>
              <p className="text-gray-600 mt-1">Configure your booking schedule</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedule'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Weekly Schedule
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'types'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Booking Types
          </button>
          <button
            onClick={() => setActiveTab('overrides')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overrides'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Date Overrides
          </button>
        </nav>
      </div>

      {/* Weekly Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Working Hours</h2>
            <button
              onClick={saveSchedule}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Set your regular availability for each day of the week.
          </p>

          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.value} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                <div className="w-32">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={windows[day.value]?.is_active || false}
                      onChange={(e) => setWindows({
                        ...windows,
                        [day.value]: { ...windows[day.value], is_active: e.target.checked }
                      })}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900">{day.label}</span>
                  </label>
                </div>

                {windows[day.value]?.is_active && (
                  <div className="flex items-center gap-3">
                    <select
                      value={windows[day.value]?.start_time || '09:00'}
                      onChange={(e) => setWindows({
                        ...windows,
                        [day.value]: { ...windows[day.value], start_time: e.target.value }
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time.value} value={time.value}>{time.label}</option>
                      ))}
                    </select>
                    <span className="text-gray-500">to</span>
                    <select
                      value={windows[day.value]?.end_time || '17:00'}
                      onChange={(e) => setWindows({
                        ...windows,
                        [day.value]: { ...windows[day.value], end_time: e.target.value }
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time.value} value={time.value}>{time.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {!windows[day.value]?.is_active && (
                  <span className="text-gray-400 text-sm">Unavailable</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Types Tab */}
      {activeTab === 'types' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Booking Types</h2>
            <button
              onClick={() => {
                setEditingType(null);
                setTypeForm({
                  name: '',
                  description: '',
                  duration_minutes: 30,
                  buffer_after_minutes: 15,
                  max_bookings_per_day: '',
                  requires_approval: false,
                  confirmation_message: '',
                  is_active: true,
                });
                setShowTypeModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add Booking Type
            </button>
          </div>

          {bookingTypes.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No booking types yet</h3>
              <p className="text-gray-600">Create your first booking type to start accepting appointments.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bookingTypes.map((type) => (
                <div key={type.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">{type.name}</h3>
                      {type.is_active === 0 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{type.description || 'No description'}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{type.duration_minutes} min</span>
                      <span>{type.buffer_after_minutes} min buffer</span>
                      {type.requires_approval === 1 && <span>Requires approval</span>}
                      <span className="text-blue-600">/book/{type.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditTypeModal(type)}
                      className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBookingType(type.id)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Date Overrides Tab */}
      {activeTab === 'overrides' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Date Overrides</h2>
              <p className="text-sm text-gray-500 mt-1">Block specific dates or add extra availability</p>
            </div>
            <button
              onClick={() => {
                setOverrideForm({
                  date: '',
                  is_available: false,
                  start_time: '09:00',
                  end_time: '17:00',
                  reason: '',
                });
                setShowOverrideModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add Override
            </button>
          </div>

          {overrides.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No date overrides</h3>
              <p className="text-gray-600">Add overrides for holidays, vacations, or special hours.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {overrides.map((override) => (
                <div key={override.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${override.is_available ? 'bg-green-100' : 'bg-red-100'}`}>
                      {override.is_available ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(override.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {override.is_available ? (
                          <>Available: {override.start_time} - {override.end_time}</>
                        ) : (
                          <>Blocked{override.reason ? `: ${override.reason}` : ''}</>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteOverride(override.id)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Type Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingType ? 'Edit Booking Type' : 'Add Booking Type'}
            </h2>
            <form onSubmit={handleTypeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  placeholder="e.g., Free Consultation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description shown to customers"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={480}
                    value={typeForm.duration_minutes}
                    onChange={(e) => setTypeForm({ ...typeForm, duration_minutes: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buffer after (minutes)</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={typeForm.buffer_after_minutes}
                    onChange={(e) => setTypeForm({ ...typeForm, buffer_after_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max bookings per day</label>
                <input
                  type="number"
                  min={1}
                  value={typeForm.max_bookings_per_day}
                  onChange={(e) => setTypeForm({ ...typeForm, max_bookings_per_day: e.target.value })}
                  placeholder="Leave empty for unlimited"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation message</label>
                <textarea
                  value={typeForm.confirmation_message}
                  onChange={(e) => setTypeForm({ ...typeForm, confirmation_message: e.target.value })}
                  rows={2}
                  placeholder="Custom message shown after booking"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={typeForm.requires_approval}
                    onChange={(e) => setTypeForm({ ...typeForm, requires_approval: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Requires approval</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={typeForm.is_active}
                    onChange={(e) => setTypeForm({ ...typeForm, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTypeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingType ? 'Save Changes' : 'Add Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Date Override</h2>
            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={overrideForm.date}
                  onChange={(e) => setOverrideForm({ ...overrideForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="is_available"
                      checked={!overrideForm.is_available}
                      onChange={() => setOverrideForm({ ...overrideForm, is_available: false })}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Block this date</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="is_available"
                      checked={overrideForm.is_available}
                      onChange={() => setOverrideForm({ ...overrideForm, is_available: true })}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Add custom hours</span>
                  </label>
                </div>
              </div>

              {overrideForm.is_available && (
                <div className="flex items-center gap-3">
                  <select
                    value={overrideForm.start_time}
                    onChange={(e) => setOverrideForm({ ...overrideForm, start_time: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time.value} value={time.value}>{time.label}</option>
                    ))}
                  </select>
                  <span className="text-gray-500">to</span>
                  <select
                    value={overrideForm.end_time}
                    onChange={(e) => setOverrideForm({ ...overrideForm, end_time: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time.value} value={time.value}>{time.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason {!overrideForm.is_available && '(optional)'}
                </label>
                <input
                  type="text"
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  placeholder={overrideForm.is_available ? 'e.g., Extended hours' : 'e.g., Holiday, Vacation'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
