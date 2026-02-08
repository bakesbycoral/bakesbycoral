'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Section, SectionHeader } from '@/components/leango';

interface BookingType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AvailableDates {
  [date: string]: TimeSlot[];
}

export default function BookingPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const [bookingType, setBookingType] = useState<BookingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState<AvailableDates>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [step, setStep] = useState<'select' | 'form' | 'success'>('select');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchBookingType() {
      try {
        const response = await fetch(`/api/bookings/types/${type}?tenant=leango`);
        if (response.ok) {
          const data = await response.json() as BookingType;
          setBookingType(data);
        }
      } catch (error) {
        console.error('Failed to fetch booking type:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookingType();
  }, [type]);

  useEffect(() => {
    async function fetchAvailability() {
      if (!bookingType) return;

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      try {
        const response = await fetch(
          `/api/bookings/availability?tenant=leango&typeId=${bookingType.id}&year=${year}&month=${month}`
        );
        if (response.ok) {
          const data = await response.json() as { dates: AvailableDates };
          setAvailableDates(data.dates);
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      }
    }

    fetchAvailability();
  }, [bookingType, currentMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !bookingType) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'leango',
          bookingTypeId: bookingType.id,
          date: selectedDate,
          time: selectedTime,
          ...formData,
        }),
      });

      if (response.ok) {
        setStep('success');
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateAvailable = (date: Date) => {
    const key = formatDateKey(date);
    return availableDates[key]?.some(slot => slot.available);
  };

  // Format time for display (08:00 -> 8:00 AM)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (loading) {
    return (
      <Section background="darker">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[#00a1f1] border-t-transparent rounded-full mx-auto" />
        </div>
      </Section>
    );
  }

  if (!bookingType) {
    return (
      <Section background="darker">
        <div className="text-center py-12">
          <SectionHeader
            title="Booking Type Not Found"
            description="The requested booking type doesn't exist."
            centered
            dark
          />
          <Link
            href="/leango"
            className="inline-flex items-center gap-2 mt-8 text-[#00a1f1] font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
        </div>
      </Section>
    );
  }

  if (step === 'success') {
    return (
      <section className="min-h-screen bg-gray-950 pt-32 pb-16 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#66d200]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#00a1f1]/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-[#66d200]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#66d200]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Booking Confirmed!</h1>
          <p className="mt-4 text-gray-400">
            We&apos;ve sent a confirmation email to {formData.email}. We look forward to speaking with you!
          </p>
          <Link
            href="/leango"
            className="inline-flex items-center justify-center px-6 py-3 mt-8 bg-[#00a1f1] text-white font-medium rounded-xl hover:bg-[#0091d8] hover:shadow-lg hover:shadow-[#00a1f1]/25 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-950 pt-32 pb-16 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#00a1f1]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#66d200]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4">
        <Link
          href="/leango"
          className="inline-flex items-center gap-2 text-[#00a1f1] hover:text-[#00a1f1]/80 text-sm font-medium mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00a1f1] to-[#0091d8] text-white px-8 py-6">
            <h1 className="text-2xl font-bold">{bookingType.name}</h1>
            {bookingType.description && (
              <p className="mt-2 text-white/80">{bookingType.description}</p>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {bookingType.duration_minutes} minutes
              </span>
            </div>
          </div>

          <div className="p-8">
            {step === 'select' && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Select a Date</h2>

                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="font-medium text-white">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                    {getDaysInMonth(currentMonth).map((day, index) => {
                      if (!day) {
                        return <div key={`empty-${index}`} />;
                      }

                      const dateKey = formatDateKey(day);
                      const isAvailable = isDateAvailable(day);
                      const isSelected = selectedDate === dateKey;
                      const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                      return (
                        <button
                          key={dateKey}
                          onClick={() => {
                            if (isAvailable && !isPast) {
                              setSelectedDate(dateKey);
                              setSelectedTime(null);
                            }
                          }}
                          disabled={!isAvailable || isPast}
                          className={`
                            aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
                            ${isSelected ? 'bg-[#00a1f1] text-white' : ''}
                            ${!isSelected && isAvailable && !isPast ? 'hover:bg-gray-800 text-white' : ''}
                            ${!isAvailable || isPast ? 'text-gray-600 cursor-not-allowed' : ''}
                          `}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">Select a Time</h2>
                  <p className="text-sm text-gray-500 mb-4">All times are Eastern Time (ET)</p>

                  {selectedDate ? (
                    <div className="space-y-2">
                      {availableDates[selectedDate]?.filter(slot => slot.available).map(slot => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`
                            w-full px-4 py-3 text-left rounded-xl border transition-all
                            ${selectedTime === slot.time
                              ? 'border-[#00a1f1] bg-[#00a1f1]/20 text-[#00a1f1]'
                              : 'border-gray-700 text-gray-300 hover:border-[#00a1f1]/50 hover:bg-gray-800/50'
                            }
                          `}
                        >
                          {formatTime(slot.time)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Please select a date first.</p>
                  )}

                  {selectedDate && selectedTime && (
                    <button
                      onClick={() => setStep('form')}
                      className="w-full mt-6 px-6 py-3 bg-[#00a1f1] text-white font-medium rounded-xl hover:bg-[#0091d8] hover:shadow-lg hover:shadow-[#00a1f1]/25 transition-all"
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === 'form' && (
              <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
                <div className="bg-[#00a1f1]/10 border border-[#00a1f1]/20 rounded-xl p-4 mb-6">
                  <p className="text-sm text-[#00a1f1]">
                    <strong>Selected:</strong> {selectedDate} at {selectedTime ? formatTime(selectedTime) : ''} ET
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="text-sm text-[#00a1f1]/80 hover:text-[#00a1f1] mt-1"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00a1f1] focus:border-[#00a1f1] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00a1f1] focus:border-[#00a1f1] transition-colors"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00a1f1] focus:border-[#00a1f1] transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00a1f1] focus:border-[#00a1f1] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
                    What would you like to discuss?
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00a1f1] focus:border-[#00a1f1] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-4 bg-[#00a1f1] text-white font-semibold rounded-xl hover:bg-[#0091d8] hover:shadow-lg hover:shadow-[#00a1f1]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
