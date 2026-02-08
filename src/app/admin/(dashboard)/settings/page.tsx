'use client';

import { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface Tenant {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  timezone: string;
}

interface BlackoutDate {
  id: string;
  date: string;
  reason: string | null;
}

type TabType = 'general' | 'notifications' | 'pricing' | 'scheduling' | 'blocked';

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (AZ)' },
  { value: 'America/Anchorage', label: 'Alaska (AK)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HI)' },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function formatCents(cents: string | undefined): string {
  if (!cents) return '';
  return (parseInt(cents) / 100).toFixed(2);
}

function toCents(dollars: string): string {
  const num = parseFloat(dollars);
  if (isNaN(num)) return '0';
  return String(Math.round(num * 100));
}

function parsePickupHours(value: string | undefined): { start: string; end: string } {
  if (!value) return { start: '', end: '' };
  try {
    return JSON.parse(value);
  } catch {
    return { start: '', end: '' };
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>([]);

  // New blackout date form
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const [addingDate, setAddingDate] = useState(false);

  // Determine if this is a bakery tenant
  const isBakery = tenant?.id === 'bakes-by-coral';

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [tenantRes, blackoutRes] = await Promise.all([
        fetch('/api/admin/tenant'),
        fetch('/api/admin/blackout'),
      ]);

      if (tenantRes.ok) {
        const data = await tenantRes.json();
        setTenant(data.tenant);
        setSettings(data.settings || {});
      }

      if (blackoutRes.ok) {
        const data = await blackoutRes.json();
        const today = new Date().toISOString().split('T')[0];
        const futureDates = (data.blackoutDates || []).filter(
          (d: BlackoutDate) => d.date >= today
        );
        setBlackoutDates(futureDates);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/tenant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: {
            name: tenant?.name,
            domain: tenant?.domain,
            logo_url: tenant?.logo_url,
            primary_color: tenant?.primary_color,
            secondary_color: tenant?.secondary_color,
            timezone: tenant?.timezone,
          },
          settings,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        // Refresh page after a short delay to update sidebar colors
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddBlackoutDate() {
    if (!newDate) return;

    const today = new Date().toISOString().split('T')[0];
    if (newDate < today) {
      setMessage({ type: 'error', text: 'Cannot block dates in the past' });
      return;
    }

    setAddingDate(true);
    try {
      const response = await fetch('/api/admin/blackout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, reason: newReason || null }),
      });

      if (response.ok) {
        setNewDate('');
        setNewReason('');
        fetchData();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to add date' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setAddingDate(false);
    }
  }

  async function handleRemoveBlackoutDate(date: string) {
    try {
      const response = await fetch(`/api/admin/blackout?date=${date}`, { method: 'DELETE' });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to remove date:', error);
    }
  }

  function updateTenant(updates: Partial<Tenant>) {
    if (tenant) {
      setTenant({ ...tenant, ...updates });
    }
  }

  function updateSetting(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function updatePriceSetting(key: string, dollars: string) {
    setSettings((prev) => ({ ...prev, [key]: toCents(dollars) }));
  }

  function updatePickupHours(day: string, field: 'start' | 'end', value: string) {
    const key = `pickup_hours_${day}`;
    const current = parsePickupHours(settings[key]);
    const updated = { ...current, [field]: value };
    setSettings((prev) => ({ ...prev, [key]: JSON.stringify(updated) }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  // Build tabs based on tenant type
  const tabs: { id: TabType; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'notifications', label: 'Notifications' },
  ];

  if (isBakery) {
    tabs.push({ id: 'pricing', label: 'Pricing' });
    tabs.push({ id: 'scheduling', label: 'Scheduling' });
    tabs.push({ id: 'blocked', label: 'Blocked Days' });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your business settings and preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6 max-w-2xl">
          {/* Business Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={tenant?.name || ''}
                  onChange={(e) => updateTenant({ name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                <input
                  type="text"
                  value={tenant?.domain || ''}
                  onChange={(e) => updateTenant({ domain: e.target.value })}
                  placeholder="example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={tenant?.timezone || 'America/New_York'}
                  onChange={(e) => updateTenant({ timezone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Logo</h3>
            <ImageUpload
              value={tenant?.logo_url || ''}
              onChange={(url) => updateTenant({ logo_url: url })}
              folder="branding"
              aspectRatio="aspect-square"
              placeholder="Upload your logo"
            />
          </div>

          {/* Brand Colors */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Colors</h3>
            <p className="text-sm text-gray-500 mb-4">
              These colors are used in the admin dashboard and can be used on your website.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={tenant?.primary_color || '#1e40af'}
                    onChange={(e) => updateTenant({ primary_color: e.target.value })}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tenant?.primary_color || '#1e40af'}
                    onChange={(e) => updateTenant({ primary_color: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={tenant?.secondary_color || '#dbeafe'}
                    onChange={(e) => updateTenant({ secondary_color: e.target.value })}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tenant?.secondary_color || '#dbeafe'}
                    onChange={(e) => updateTenant({ secondary_color: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
            {/* Preview */}
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: tenant?.secondary_color || '#dbeafe' }}>
              <div className="text-sm font-medium" style={{ color: tenant?.primary_color || '#1e40af' }}>
                Preview: This is how your brand colors look together
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Email Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Emails</label>
                <textarea
                  value={settings.admin_email || ''}
                  onChange={(e) => updateSetting('admin_email', e.target.value)}
                  placeholder="admin@example.com, manager@example.com"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated list of emails that receive notifications and alerts</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                <input
                  type="text"
                  value={settings.email_from_name || ''}
                  onChange={(e) => updateSetting('email_from_name', e.target.value)}
                  placeholder={tenant?.name || 'Your Business'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Email Address</label>
                <input
                  type="email"
                  value={settings.email_from_address || ''}
                  onChange={(e) => updateSetting('email_from_address', e.target.value)}
                  placeholder="newsletter@yourdomain.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Must be a verified email address in your Resend sending domain</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reply-To Email</label>
                <input
                  type="email"
                  value={settings.email_reply_to || ''}
                  onChange={(e) => updateSetting('email_reply_to', e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resend Configuration</h3>
            <p className="text-sm text-gray-500 mb-4">
              Configure your Resend API key for sending emails. Each tenant can have its own API key and sending domain.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resend API Key</label>
                <input
                  type="password"
                  value={settings.resend_api_key || ''}
                  onChange={(e) => updateSetting('resend_api_key', e.target.value)}
                  placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to use the global default API key</p>
              </div>
            </div>
          </div>

          {isBakery && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pickup Reminders</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reminder_enabled === 'true'}
                    onChange={(e) => updateSetting('reminder_enabled', e.target.checked ? 'true' : 'false')}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Send pickup reminder emails to customers</span>
                </label>

                {settings.reminder_enabled === 'true' && (
                  <div className="ml-8">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Days Before Pickup</label>
                    <select
                      value={settings.reminder_days_before || '1'}
                      onChange={(e) => updateSetting('reminder_days_before', e.target.value)}
                      className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">1 day before</option>
                      <option value="2">2 days before</option>
                      <option value="3">3 days before</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pricing Tab (Bakery only) */}
      {activeTab === 'pricing' && isBakery && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cookie Pricing</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price per Dozen ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formatCents(settings.cookie_price_per_dozen)}
                onChange={(e) => updatePriceSetting('cookie_price_per_dozen', e.target.value)}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cake Base Prices</h3>
            <div className="grid grid-cols-2 gap-4">
              {['4', '6', '8', '10'].map((size) => (
                <div key={size}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{size}-inch ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formatCents(settings[`cake_price_${size}_inch`])}
                    onChange={(e) => updatePriceSetting(`cake_price_${size}_inch`, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Design Multipliers</h3>
            <p className="text-sm text-gray-500 mb-4">Enter as decimal (e.g., 1.25 for 25% increase)</p>
            <div className="grid grid-cols-3 gap-4">
              {['simple', 'moderate', 'intricate'].map((style) => (
                <div key={style}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{style}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={settings[`design_multiplier_${style}`] || '1.00'}
                    onChange={(e) => updateSetting(`design_multiplier_${style}`, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Times</h3>
            <p className="text-sm text-gray-500 mb-4">Minimum days notice required for each order type</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Small Cookies (days)</label>
                <input
                  type="number"
                  min="1"
                  value={settings.lead_time_small_cookie || '7'}
                  onChange={(e) => updateSetting('lead_time_small_cookie', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Large Cookies (days)</label>
                <input
                  type="number"
                  min="1"
                  value={settings.lead_time_large_cookie || '14'}
                  onChange={(e) => updateSetting('lead_time_large_cookie', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Cakes (days)</label>
                <input
                  type="number"
                  min="1"
                  value={settings.lead_time_cake || '14'}
                  onChange={(e) => updateSetting('lead_time_cake', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weddings (days)</label>
                <input
                  type="number"
                  min="1"
                  value={settings.lead_time_wedding || '30'}
                  onChange={(e) => updateSetting('lead_time_wedding', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduling Tab (Bakery only) */}
      {activeTab === 'scheduling' && isBakery && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pickup Hours</h3>
            <p className="text-sm text-gray-500 mb-4">Set available pickup hours for each day</p>
            <div className="space-y-4">
              {DAYS.map((day) => {
                const hours = parsePickupHours(settings[`pickup_hours_${day}`]);
                const isClosed = !hours.start && !hours.end;
                return (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-28 font-medium text-gray-900 capitalize">{day}</div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!isClosed}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updatePickupHours(day, 'start', '09:00');
                            setTimeout(() => updatePickupHours(day, 'end', '17:00'), 0);
                          } else {
                            setSettings((prev) => ({
                              ...prev,
                              [`pickup_hours_${day}`]: JSON.stringify({ start: '', end: '' }),
                            }));
                          }
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${isClosed ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                        {isClosed ? 'Closed' : 'Open'}
                      </span>
                    </label>
                    {!isClosed && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={hours.start}
                          onChange={(e) => updatePickupHours(day, 'start', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="time"
                          value={hours.end}
                          onChange={(e) => updatePickupHours(day, 'end', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Slot Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickups per Time Slot</label>
                <input
                  type="number"
                  min="1"
                  value={settings.default_slot_capacity || '2'}
                  onChange={(e) => updateSetting('default_slot_capacity', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Max orders per slot</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Interval (minutes)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={settings.slot_interval_minutes || '30'}
                  onChange={(e) => updateSetting('slot_interval_minutes', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blocked Days Tab (Bakery only) */}
      {activeTab === 'blocked' && isBakery && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Block Days</h3>
            <p className="text-sm text-gray-500 mb-4">
              Block off days when you cannot take orders (vacation, holidays, etc.)
            </p>

            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                  <input
                    type="text"
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    placeholder="e.g., Vacation, Holiday"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={handleAddBlackoutDate}
                disabled={addingDate || !newDate}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {addingDate ? 'Adding...' : 'Block This Day'}
              </button>
            </div>

            <h4 className="text-sm font-medium text-gray-700 mb-3">Upcoming Blocked Days</h4>
            {blackoutDates.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No blocked days scheduled. All days are available for orders.
              </p>
            ) : (
              <div className="space-y-2">
                {blackoutDates.map((blackout) => (
                  <div
                    key={blackout.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{formatDate(blackout.date)}</div>
                      {blackout.reason && (
                        <div className="text-sm text-gray-500">{blackout.reason}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveBlackoutDate(blackout.date)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        </div>
      )}
    </div>
  );
}
