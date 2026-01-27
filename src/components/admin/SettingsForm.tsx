'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

interface PickupHours {
  start: string;
  end: string;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Default values from website
const DEFAULT_SETTINGS: Record<string, string> = {
  // Pricing (in cents)
  cookie_price_per_dozen: '3000',      // $30/dozen
  cake_price_4_inch: '6000',           // $60
  cake_price_6_inch: '10000',          // $100
  cake_price_8_inch: '14000',          // $140
  cake_price_10_inch: '18000',         // $180
  // Lead times (in days)
  lead_time_small_cookie: '7',
  lead_time_large_cookie: '14',
  lead_time_cake: '14',
  lead_time_wedding: '30',
  // Design multipliers
  design_multiplier_simple: '1.00',
  design_multiplier_moderate: '1.25',
  design_multiplier_intricate: '1.50',
  // Scheduling
  default_slot_capacity: '2',
  slot_interval_minutes: '30',
};

function parsePickupHours(value: string | undefined): PickupHours {
  if (!value) return { start: '', end: '' };
  try {
    return JSON.parse(value);
  } catch {
    return { start: '', end: '' };
  }
}

function formatCents(cents: string | undefined): string {
  if (!cents) return '';
  return (parseInt(cents) / 100).toFixed(2);
}

function toCents(dollars: string): string {
  const num = parseFloat(dollars);
  if (isNaN(num)) return '0';
  return String(Math.round(num * 100));
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();
  // Filter out empty values from initial settings, then merge with defaults
  const filteredInitial = Object.fromEntries(
    Object.entries(initialSettings).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS, ...filteredInitial });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePriceChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: toCents(value),
    }));
  };

  const handleNumberChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleHoursChange = (day: string, field: 'start' | 'end', value: string) => {
    const key = `pickup_hours_${day}`;
    const current = parsePickupHours(settings[key]);
    const updated = { ...current, [field]: value };
    setSettings((prev) => ({
      ...prev,
      [key]: JSON.stringify(updated),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      const data = await response.json() as { success?: boolean; error?: string };

      if (data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Pricing */}
      <section className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
        <h2 className="text-lg font-semibold text-[#541409] mb-6">Pricing</h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-[#541409] mb-4">Cookies</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Price per Dozen ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formatCents(settings.cookie_price_per_dozen)}
                  onChange={(e) => handlePriceChange('cookie_price_per_dozen', e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409] placeholder:text-[#541409]/50"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-[#541409] mb-4">Cake Base Prices</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {['4', '6', '8', '10'].map((size) => (
                <div key={size}>
                  <label className="block text-sm text-[#541409]/70 mb-1">{size}-inch ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formatCents(settings[`cake_price_${size}_inch`])}
                    onChange={(e) => handlePriceChange(`cake_price_${size}_inch`, e.target.value)}
                    className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409] placeholder:text-[#541409]/50"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-[#541409] mb-4">Design Style Multipliers</h3>
            <p className="text-sm text-[#541409]/60 mb-4">Enter as decimal (e.g., 1.25 for 25% increase)</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {['simple', 'moderate', 'intricate'].map((style) => (
                <div key={style}>
                  <label className="block text-sm text-[#541409]/70 mb-1 capitalize">{style}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={settings[`design_multiplier_${style}`]}
                    onChange={(e) => handleNumberChange(`design_multiplier_${style}`, e.target.value)}
                    className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409] placeholder:text-[#541409]/50"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lead Times */}
      <section className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
        <h2 className="text-lg font-semibold text-[#541409] mb-6">Lead Times</h2>
        <p className="text-sm text-[#541409]/60 mb-4">Minimum days notice required for each order type</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">Small Cookies (days)</label>
            <input
              type="number"
              min="1"
              value={settings.lead_time_small_cookie}
              onChange={(e) => handleNumberChange('lead_time_small_cookie', e.target.value)}
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409] placeholder:text-[#541409]/50"
            />
          </div>
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">Large Cookies (days)</label>
            <input
              type="number"
              min="1"
              value={settings.lead_time_large_cookie}
              onChange={(e) => handleNumberChange('lead_time_large_cookie', e.target.value)}
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409] placeholder:text-[#541409]/50"
            />
          </div>
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">Custom Cakes (days)</label>
            <input
              type="number"
              min="1"
              value={settings.lead_time_cake}
              onChange={(e) => handleNumberChange('lead_time_cake', e.target.value)}
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409] placeholder:text-[#541409]/50"
            />
          </div>
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">Weddings (days)</label>
            <input
              type="number"
              min="1"
              value={settings.lead_time_wedding}
              onChange={(e) => handleNumberChange('lead_time_wedding', e.target.value)}
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409] placeholder:text-[#541409]/50"
            />
          </div>
        </div>
      </section>

      {/* Pickup Schedule */}
      <section className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
        <h2 className="text-lg font-semibold text-[#541409] mb-6">Pickup Hours</h2>
        <p className="text-sm text-[#541409]/60 mb-4">Set available pickup hours for each day. Toggle off for closed days.</p>

        <div className="space-y-4">
          {DAYS.map((day) => {
            const hours = parsePickupHours(settings[`pickup_hours_${day}`]);
            const isClosed = !hours.start && !hours.end;
            return (
              <div key={day} className="flex items-center gap-4">
                <div className="w-28 font-medium text-[#541409] capitalize">{day}</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!isClosed}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Opening - set default hours
                        handleHoursChange(day, 'start', '09:00');
                        setTimeout(() => handleHoursChange(day, 'end', '17:00'), 0);
                      } else {
                        // Closing - clear hours
                        setSettings((prev) => ({
                          ...prev,
                          [`pickup_hours_${day}`]: JSON.stringify({ start: '', end: '' }),
                        }));
                      }
                    }}
                    className="w-5 h-5 rounded border-[#EAD6D6] text-[#541409] focus:ring-[#541409]"
                  />
                  <span className={`text-sm ${isClosed ? 'text-red-500 font-medium' : 'text-[#541409]/60'}`}>
                    {isClosed ? 'Closed' : 'Open'}
                  </span>
                </label>
                {!isClosed && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={hours.start}
                      onChange={(e) => handleHoursChange(day, 'start', e.target.value)}
                      className="px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                    />
                    <span className="text-[#541409]/40">to</span>
                    <input
                      type="time"
                      value={hours.end}
                      onChange={(e) => handleHoursChange(day, 'end', e.target.value)}
                      className="px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Slot Capacity */}
      <section className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
        <h2 className="text-lg font-semibold text-[#541409] mb-6">Scheduling</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">Pickups per Time Slot</label>
            <input
              type="number"
              min="1"
              value={settings.default_slot_capacity}
              onChange={(e) => handleNumberChange('default_slot_capacity', e.target.value)}
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409] placeholder:text-[#541409]/50"
            />
            <p className="text-xs text-[#541409]/60 mt-1">Maximum number of orders that can be scheduled per 30-minute slot</p>
          </div>
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">Time Slot Interval (minutes)</label>
            <input
              type="number"
              min="15"
              step="15"
              value={settings.slot_interval_minutes}
              onChange={(e) => handleNumberChange('slot_interval_minutes', e.target.value)}
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409] placeholder:text-[#541409]/50"
            />
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-[#541409] text-[#EAD6D6] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
