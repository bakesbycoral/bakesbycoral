'use client';

import { useState, useEffect, useCallback } from 'react';
import type { OrderType } from '@/types';

interface SlotData {
  date: string;
  time: string;
  available: boolean;
  remaining: number;
}

interface SlotsApiResponse {
  slots: SlotData[];
  leadTimeDays: number;
  minDate: string;
}

interface TimeSlotPickerProps {
  orderType: OrderType;
  value?: { date: string; time: string };
  onChange: (value: { date: string; time: string } | null) => void;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function TimeSlotPicker({
  orderType,
  value,
  onChange,
  label = 'Select Pickup Date & Time',
  required = false,
  error,
  className = '',
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [minDate, setMinDate] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(value?.date || null);

  // Fetch slots for the current month view
  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-01`;
      const endDay = getDaysInMonth(currentMonth.year, currentMonth.month);
      const endDate = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

      const response = await fetch(`/api/slots?start=${startDate}&end=${endDate}&type=${orderType}`);
      if (!response.ok) throw new Error('Failed to fetch slots');

      const data: SlotsApiResponse = await response.json();
      setSlots(data.slots);
      setMinDate(data.minDate);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, orderType]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Get slots for a specific date
  const getSlotsForDate = (dateStr: string): SlotData[] => {
    return slots.filter(s => s.date === dateStr);
  };

  // Check if a date has any available slots
  const hasAvailableSlots = (dateStr: string): boolean => {
    const dateSlots = getSlotsForDate(dateStr);
    return dateSlots.some(s => s.available);
  };

  // Check if a date is past the minimum date
  const isDateValid = (dateStr: string): boolean => {
    return dateStr >= minDate;
  };

  // Navigation handlers
  const goToPrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // Handle date selection
  const handleDateClick = (day: number) => {
    const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (isDateValid(dateStr) && hasAvailableSlots(dateStr)) {
      setSelectedDate(dateStr);
      onChange(null); // Clear time when date changes
    }
  };

  // Handle time selection
  const handleTimeClick = (time: string) => {
    if (selectedDate) {
      onChange({ date: selectedDate, time });
    }
  };

  // Generate calendar grid
  const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
  const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);
  const calendarDays: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const today = new Date();
  const isCurrentMonth = currentMonth.year === today.getFullYear() && currentMonth.month === today.getMonth();

  const selectedDateSlots = selectedDate ? getSlotsForDate(selectedDate) : [];

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[#541409] mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="border border-stone-300 rounded-lg overflow-hidden bg-white">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#EAD6D6]/50 border-b border-stone-200">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="p-1 hover:bg-stone-200 rounded transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5 text-[#541409]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-medium text-[#541409]">
            {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
          </span>
          <button
            type="button"
            onClick={goToNextMonth}
            className="p-1 hover:bg-stone-200 rounded transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5 text-[#541409]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-2">
          {/* Day names */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map(day => (
              <div key={day} className="text-center text-xs font-medium text-stone-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          {loading ? (
            <div className="py-8 text-center text-stone-500">
              Loading availability...
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isValid = isDateValid(dateStr);
                const hasSlots = hasAvailableSlots(dateStr);
                const isToday = isCurrentMonth && day === today.getDate();
                const isSelected = dateStr === selectedDate;
                const isClickable = isValid && hasSlots;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    disabled={!isClickable}
                    className={`
                      aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
                      ${isSelected
                        ? 'bg-[#541409] text-white font-semibold'
                        : isClickable
                          ? 'hover:bg-[#EAD6D6] text-[#541409] cursor-pointer'
                          : 'text-stone-300 cursor-not-allowed'
                      }
                      ${isToday && !isSelected ? 'ring-2 ring-[#541409]/30' : ''}
                      ${isValid && hasSlots && !isSelected ? 'font-medium' : ''}
                    `}
                    aria-label={`${day} ${MONTH_NAMES[currentMonth.month]} ${currentMonth.year}${!isClickable ? ' (unavailable)' : ''}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="border-t border-stone-200 p-4 bg-stone-50">
            <h4 className="text-sm font-medium text-[#541409] mb-3">
              Available Times for {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h4>
            {selectedDateSlots.length === 0 ? (
              <p className="text-sm text-stone-500">No time slots available for this date.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {selectedDateSlots.map(slot => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => handleTimeClick(slot.time)}
                    disabled={!slot.available}
                    className={`
                      px-3 py-2 text-sm rounded-lg border transition-colors
                      ${value?.time === slot.time && value?.date === selectedDate
                        ? 'bg-[#541409] text-white border-[#541409]'
                        : slot.available
                          ? 'bg-white border-stone-200 text-[#541409] hover:border-[#541409] hover:bg-[#EAD6D6]/30'
                          : 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <span className="block">{formatTime(slot.time)}</span>
                    {slot.available && slot.remaining <= 2 && (
                      <span className="block text-xs mt-0.5 opacity-75">
                        {slot.remaining} left
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Value Display */}
        {value?.date && value?.time && (
          <div className="border-t border-stone-200 px-4 py-3 bg-[#541409]/5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-stone-600">Selected:</span>
                <span className="ml-2 font-medium text-[#541409]">
                  {new Date(value.date + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })} at {formatTime(value.time)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(null);
                  onChange(null);
                }}
                className="text-sm text-[#541409] hover:underline"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}

      {/* Lead time notice */}
      <p className="mt-2 text-xs text-stone-500">
        {orderType === 'cookies' && 'Cookie orders require at least 7 days notice.'}
        {orderType === 'cookie_cups' && 'Cookie cup orders require at least 7 days notice.'}
        {orderType === 'cookies_large' && 'Large cookie orders require at least 14 days notice.'}
        {orderType === 'cake' && 'Cake orders require at least 14 days notice.'}
        {orderType === 'wedding' && 'Wedding orders require at least 30 days notice.'}
      </p>
    </div>
  );
}
