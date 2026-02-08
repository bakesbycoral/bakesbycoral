'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_date: string | null;
  pickup_date: string | null;
  pickup_time: string | null;
  backup_date: string | null;
  backup_time: string | null;
  pickup_person_name: string | null;
  total_amount: number | null;
  deposit_amount: number | null;
  notes: string | null;
  form_data: string | null;
}

interface OrderEditFormProps {
  order: Order;
  onCancel: () => void;
  onSave: () => void;
}

const COOKIE_FLAVORS = [
  { key: 'chocolateChip', label: 'Chocolate Chip' },
  { key: 'vanillaBeanSugar', label: 'Vanilla Bean Sugar' },
  { key: 'cherryAlmond', label: 'Cherry Almond' },
  { key: 'espressoButterscotch', label: 'Espresso Butterscotch' },
  { key: 'lemonSugar', label: 'Lemon Sugar' },
];

const CAKE_TOPPINGS = [
  { value: 'light-beading', label: 'Light Beading (+$8)' },
  { value: 'moderate-beading', label: 'Moderate Beading (+$15)' },
  { value: 'heavy-beading', label: 'Heavy Beading (+$20)' },
  { value: 'ribbon-bows', label: 'Ribbon Bows (+$8)' },
  { value: 'cherries', label: 'Cherries (+$8)' },
  { value: 'glitter-cherries', label: 'Glitter Cherries (+$15)' },
  { value: 'disco-balls', label: 'Disco Balls (+$10)' },
  { value: 'balloons', label: 'Balloons (+$10)' },
  { value: 'fresh-florals', label: 'Fresh Florals (+$15)' },
  { value: 'faux-florals', label: 'Faux Florals (+$15)' },
  { value: 'fruit', label: 'Fruit (+$8)' },
  { value: 'edible-image', label: 'Edible Image (+$10)' },
  { value: 'other', label: 'Other (+$8)' },
];

export function OrderEditForm({ order, onCancel, onSave }: OrderEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Parse form_data
  const initialFormData = order.form_data ? JSON.parse(order.form_data) : {};

  // Customer info
  const [customerName, setCustomerName] = useState(order.customer_name);
  const [customerEmail, setCustomerEmail] = useState(order.customer_email);
  const [customerPhone, setCustomerPhone] = useState(order.customer_phone);
  const [pickupPersonName, setPickupPersonName] = useState(order.pickup_person_name || '');

  // Schedule
  const [pickupDate, setPickupDate] = useState(order.pickup_date || '');
  const [pickupTime, setPickupTime] = useState(order.pickup_time || '');
  const [eventDate, setEventDate] = useState(order.event_date || '');
  const [backupDate, setBackupDate] = useState(order.backup_date || '');
  const [backupTime, setBackupTime] = useState(order.backup_time || '');

  // Payment (in dollars for display)
  const [totalAmount, setTotalAmount] = useState(
    order.total_amount ? (order.total_amount / 100).toFixed(2) : ''
  );
  const [depositAmount, setDepositAmount] = useState(
    order.deposit_amount ? (order.deposit_amount / 100).toFixed(2) : ''
  );

  // Notes
  const [notes, setNotes] = useState(order.notes || '');

  // Form data (order-type specific)
  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          pickup_person_name: pickupPersonName || null,
          pickup_date: pickupDate || null,
          pickup_time: pickupTime || null,
          event_date: eventDate || null,
          backup_date: backupDate || null,
          backup_time: backupTime || null,
          total_amount: totalAmount ? Math.round(parseFloat(totalAmount) * 100) : null,
          deposit_amount: depositAmount ? Math.round(parseFloat(depositAmount) * 100) : null,
          notes: notes || null,
          form_data: formData,
        }),
      });

      const data = await response.json() as { success?: boolean; error?: string };

      if (data.success) {
        router.refresh();
        onSave();
      } else {
        setError(data.error || 'Failed to update order');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (key: string, value: unknown) => {
    setFormData((prev: Record<string, unknown>) => ({ ...prev, [key]: value }));
  };

  // Cookie flavor helpers
  const cookieFlavors = formData.flavors || formData.cookie_flavors || formData.cookieFlavors || {};
  const updateCookieFlavor = (key: string, value: number) => {
    const newFlavors = { ...cookieFlavors, [key]: value };
    // Store in the format the form expects
    if (order.order_type === 'wedding') {
      updateFormData('cookieFlavors', newFlavors);
    } else {
      updateFormData('flavors', newFlavors);
    }
  };

  // Topping helpers
  const toppings = formData.toppings || formData.cake_toppings || formData.cakeToppings || [];
  const updateToppings = (value: string, checked: boolean) => {
    let newToppings: string[];
    if (checked) {
      newToppings = [...toppings, value];
    } else {
      newToppings = toppings.filter((t: string) => t !== value);
    }
    if (order.order_type === 'wedding') {
      updateFormData('cakeToppings', newToppings);
    } else {
      updateFormData('toppings', newToppings);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Customer Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
        <h2 className="font-semibold text-[#541409] mb-4">Customer Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">
              {order.order_type === 'wedding' ? "Couple's Names" : 'Name'} *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
            />
          </div>
          {order.order_type === 'wedding' && (
            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">Primary Contact Name</label>
              <input
                type="text"
                value={formData.partner_name || ''}
                onChange={(e) => updateFormData('partner_name', e.target.value)}
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">Email *</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">Phone *</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">Pickup Person</label>
            <input
              type="text"
              value={pickupPersonName}
              onChange={(e) => setPickupPersonName(e.target.value)}
              placeholder="If different from customer"
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
            />
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
        <h2 className="font-semibold text-[#541409] mb-4">Schedule</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(order.order_type === 'cake' || order.order_type === 'cookies_large') && (
            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
              />
            </div>
          )}
          {order.order_type === 'wedding' && (
            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">Wedding Date</label>
              <input
                type="date"
                value={formData.wedding_date || eventDate || ''}
                onChange={(e) => {
                  updateFormData('wedding_date', e.target.value);
                  setEventDate(e.target.value);
                }}
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
              />
            </div>
          )}
          {!(order.order_type === 'cookies_large' && formData.pickup_or_delivery === 'delivery') && (
            <>
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Pickup Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Pickup Time</label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">Backup Date</label>
            <input
              type="date"
              value={backupDate}
              onChange={(e) => setBackupDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">Backup Time</label>
            <input
              type="time"
              value={backupTime}
              onChange={(e) => setBackupTime(e.target.value)}
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
            />
          </div>
        </div>
      </div>

      {/* Order Details - Cookies (1-3 dozen) */}
      {order.order_type === 'cookies' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
          <h2 className="font-semibold text-[#541409] mb-4">Cookie Order Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">Quantity (dozen)</label>
              <select
                value={formData.quantity || ''}
                onChange={(e) => updateFormData('quantity', e.target.value)}
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
              >
                <option value="">Select</option>
                <option value="1">1 Dozen - $30</option>
                <option value="2">2 Dozen - $60</option>
                <option value="3">3 Dozen - $90</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-2">Flavors (count per flavor)</label>
              <div className="space-y-2">
                {COOKIE_FLAVORS.map((flavor) => (
                  <div key={flavor.key} className="flex items-center justify-between">
                    <span className="text-[#541409]">{flavor.label}</span>
                    <input
                      type="number"
                      min="0"
                      step="6"
                      value={cookieFlavors[flavor.key] || 0}
                      onChange={(e) => updateCookieFlavor(flavor.key, parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-[#EAD6D6] rounded text-center text-[#541409]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">Packaging</label>
              <select
                value={formData.packaging || ''}
                onChange={(e) => updateFormData('packaging', e.target.value)}
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
              >
                <option value="">Select</option>
                <option value="standard">Standard</option>
                <option value="heat-sealed">Individually Heat Sealed (+$5/dozen)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">Allergies</label>
              <input
                type="text"
                value={formData.allergies || ''}
                onChange={(e) => updateFormData('allergies', e.target.value)}
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">How did they hear about you?</label>
              <input
                type="text"
                value={formData.how_did_you_hear || ''}
                onChange={(e) => updateFormData('how_did_you_hear', e.target.value)}
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Order Details - Large Cookie Orders (4+ dozen) */}
      {order.order_type === 'cookies_large' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
          <h2 className="font-semibold text-[#541409] mb-4">Large Cookie Order Details</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Event Type</label>
                <select
                  value={formData.event_type || ''}
                  onChange={(e) => updateFormData('event_type', e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                >
                  <option value="">Select</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="party">Party</option>
                  <option value="shower">Baby/Bridal Shower</option>
                  <option value="fundraiser">Fundraiser</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Pickup or Delivery</label>
                <select
                  value={formData.pickup_or_delivery || 'pickup'}
                  onChange={(e) => updateFormData('pickup_or_delivery', e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                >
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery (+$75)</option>
                </select>
              </div>

              {formData.pickup_or_delivery === 'delivery' && (
                <>
                  <div>
                    <label className="block text-sm text-[#541409]/70 mb-1">Delivery Location</label>
                    <input
                      type="text"
                      value={formData.event_location || ''}
                      onChange={(e) => updateFormData('event_location', e.target.value)}
                      placeholder="Address for delivery"
                      className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#541409]/70 mb-1">Preferred Delivery Date</label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#541409]/70 mb-1">Preferred Delivery Time</label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Quantity (dozen)</label>
                <select
                  value={formData.quantity || ''}
                  onChange={(e) => updateFormData('quantity', e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                >
                  <option value="">Select</option>
                  {[4,5,6,7,8,9,10,11,12,15,20].map(n => (
                    <option key={n} value={n}>{n} Dozen{n >= 10 ? ' (5% off!)' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-2">Flavors (count per flavor)</label>
              <div className="space-y-2">
                {COOKIE_FLAVORS.map((flavor) => (
                  <div key={flavor.key} className="flex items-center justify-between">
                    <span className="text-[#541409]">{flavor.label}</span>
                    <input
                      type="number"
                      min="0"
                      step="12"
                      value={cookieFlavors[flavor.key] || 0}
                      onChange={(e) => updateCookieFlavor(flavor.key, parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-[#EAD6D6] rounded text-center text-[#541409]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">Packaging</label>
              <select
                value={formData.packaging || ''}
                onChange={(e) => updateFormData('packaging', e.target.value)}
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
              >
                <option value="">Select</option>
                <option value="standard">Standard</option>
                <option value="heat-sealed">Individually Heat Sealed (+$5/dozen)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">Allergies</label>
              <input
                type="text"
                value={formData.allergies || ''}
                onChange={(e) => updateFormData('allergies', e.target.value)}
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">How did they hear about you?</label>
              <input
                type="text"
                value={formData.how_did_you_hear || ''}
                onChange={(e) => updateFormData('how_did_you_hear', e.target.value)}
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Order Details - Cake */}
      {order.order_type === 'cake' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
          <h2 className="font-semibold text-[#541409] mb-4">Cake Order Details</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Event Type</label>
                <select
                  value={formData.event_type || ''}
                  onChange={(e) => updateFormData('event_type', e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                >
                  <option value="">Select</option>
                  <option value="birthday">Birthday</option>
                  <option value="baby-shower">Baby Shower</option>
                  <option value="bridal-shower">Bridal Shower</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="graduation">Graduation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Cake Size</label>
                <select
                  value={formData.cake_size || ''}
                  onChange={(e) => updateFormData('cake_size', e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                >
                  <option value="">Select</option>
                  <option value="4-inch">4" (serves 2-4) - $60</option>
                  <option value="6-inch">6" (serves 6-12) - $100</option>
                  <option value="8-inch">8" (serves 14-20) - $140</option>
                  <option value="10-inch">10" (serves 24-30) - $180</option>
                  <option value="unsure">Not sure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Cake Shape</label>
                <select
                  value={formData.cake_shape || ''}
                  onChange={(e) => updateFormData('cake_shape', e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                >
                  <option value="">Select</option>
                  <option value="round">Round</option>
                  <option value="heart">Heart</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Cake Flavor</label>
                <select
                  value={formData.cake_flavor || ''}
                  onChange={(e) => updateFormData('cake_flavor', e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                >
                  <option value="">Select</option>
                  <option value="vanilla-bean">Vanilla Bean</option>
                  <option value="chocolate">Chocolate</option>
                  <option value="confetti">Confetti</option>
                  <option value="red-velvet">Red Velvet</option>
                  <option value="lemon">Lemon</option>
                  <option value="vanilla-latte">Vanilla Latte (+$5)</option>
                  <option value="marble">Marble</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Filling</label>
                <select
                  value={formData.filling || ''}
                  onChange={(e) => updateFormData('filling', e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                >
                  <option value="">None</option>
                  <option value="chocolate-ganache">Chocolate Ganache (+$10)</option>
                  <option value="cookies-and-cream">Cookies & Cream (+$5)</option>
                  <option value="vanilla-bean-ganache">Vanilla Bean Ganache (+$10)</option>
                  <option value="fresh-strawberries">Fresh Strawberries (+$8)</option>
                  <option value="lemon-ganache">Lemon Ganache (+$5)</option>
                  <option value="raspberry">Raspberry (+$8)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Message Style</label>
                <select
                  value={formData.message_style || ''}
                  onChange={(e) => updateFormData('message_style', e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                >
                  <option value="">Select</option>
                  <option value="piped">Piped</option>
                  <option value="piped-cursive">Piped Cursive</option>
                  <option value="block">Block</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">Base Color</label>
              <input
                type="text"
                value={formData.base_color || ''}
                onChange={(e) => updateFormData('base_color', e.target.value)}
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">Piping Colors</label>
              <input
                type="text"
                value={formData.piping_colors || ''}
                onChange={(e) => updateFormData('piping_colors', e.target.value)}
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">Custom Messaging</label>
              <input
                type="text"
                value={formData.custom_messaging || ''}
                onChange={(e) => updateFormData('custom_messaging', e.target.value)}
                placeholder="Text on cake (or N/A)"
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-2">Toppings</label>
              <div className="grid grid-cols-2 gap-2">
                {CAKE_TOPPINGS.map((topping) => (
                  <label key={topping.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={toppings.includes(topping.value)}
                      onChange={(e) => updateToppings(topping.value, e.target.checked)}
                      className="w-4 h-4 text-[#541409] border-[#EAD6D6] rounded focus:ring-[#541409]"
                    />
                    <span className="text-sm text-[#541409]">{topping.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">Allergies</label>
              <input
                type="text"
                value={formData.allergies || ''}
                onChange={(e) => updateFormData('allergies', e.target.value)}
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">How did they hear about you?</label>
              <input
                type="text"
                value={formData.how_did_you_hear || ''}
                onChange={(e) => updateFormData('how_did_you_hear', e.target.value)}
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Order Details - Wedding */}
      {order.order_type === 'wedding' && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
            <h2 className="font-semibold text-[#541409] mb-4">Wedding Details</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-[#541409]/70 mb-1">Guest Count</label>
                  <select
                    value={formData.guest_count || ''}
                    onChange={(e) => updateFormData('guest_count', e.target.value)}
                    className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                  >
                    <option value="">Select</option>
                    <option value="25-50">25-50 guests</option>
                    <option value="50-100">50-100 guests</option>
                    <option value="100-150">100-150 guests</option>
                    <option value="150-200">150-200 guests</option>
                    <option value="200+">200+ guests</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#541409]/70 mb-1">Services Needed</label>
                  <select
                    value={formData.services_needed || ''}
                    onChange={(e) => updateFormData('services_needed', e.target.value)}
                    className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                  >
                    <option value="">Select</option>
                    <option value="cutting_cake">Cutting Cake</option>
                    <option value="cookies">Cookies</option>
                    <option value="cake_and_cookies">Cake + Cookies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#541409]/70 mb-1">Pickup or Delivery</label>
                  <select
                    value={formData.pickup_or_delivery || 'pickup'}
                    onChange={(e) => updateFormData('pickup_or_delivery', e.target.value)}
                    className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                  >
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery (+$75)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#541409]/70 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.start_time || ''}
                    onChange={(e) => updateFormData('start_time', e.target.value)}
                    className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Venue Name</label>
                <input
                  type="text"
                  value={formData.venue_name || ''}
                  onChange={(e) => updateFormData('venue_name', e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Venue Address</label>
                <input
                  type="text"
                  value={formData.venue_address || ''}
                  onChange={(e) => updateFormData('venue_address', e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">On-Site Contact</label>
                <input
                  type="text"
                  value={formData.onsite_contact || ''}
                  onChange={(e) => updateFormData('onsite_contact', e.target.value)}
                  placeholder="Coordinator name & phone"
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>

              {formData.pickup_or_delivery === 'delivery' && (
                <div>
                  <label className="block text-sm text-[#541409]/70 mb-1">Setup Requirements</label>
                  <textarea
                    value={formData.setup_requirements || ''}
                    onChange={(e) => updateFormData('setup_requirements', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Dietary Restrictions</label>
                <input
                  type="text"
                  value={formData.dietary_restrictions || ''}
                  onChange={(e) => updateFormData('dietary_restrictions', e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">How did they hear about you?</label>
                <input
                  type="text"
                  value={formData.how_found_us || ''}
                  onChange={(e) => updateFormData('how_found_us', e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>
            </div>
          </div>

          {/* Wedding Cake Details */}
          {['cutting_cake', 'cake_and_cookies'].includes(formData.services_needed || '') && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
              <h2 className="font-semibold text-[#541409] mb-4">Cutting Cake Details</h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm text-[#541409]/70 mb-1">Cake Size</label>
                    <select
                      value={formData.cake_size || ''}
                      onChange={(e) => updateFormData('cake_size', e.target.value)}
                      className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                    >
                      <option value="">Select</option>
                      <option value="6-inch">6" - $115</option>
                      <option value="8-inch">8" - $155</option>
                      <option value="10-inch">10" - $195</option>
                      <option value="unsure">Not sure</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-[#541409]/70 mb-1">Cake Shape</label>
                    <select
                      value={formData.cake_shape || ''}
                      onChange={(e) => updateFormData('cake_shape', e.target.value)}
                      className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                    >
                      <option value="">Select</option>
                      <option value="round">Round</option>
                      <option value="heart">Heart</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-[#541409]/70 mb-1">Cake Flavor</label>
                    <select
                      value={formData.cake_flavor || ''}
                      onChange={(e) => updateFormData('cake_flavor', e.target.value)}
                      className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                    >
                      <option value="">Select</option>
                      <option value="vanilla-bean">Vanilla Bean</option>
                      <option value="chocolate">Chocolate</option>
                      <option value="confetti">Confetti</option>
                      <option value="red-velvet">Red Velvet</option>
                      <option value="lemon">Lemon</option>
                      <option value="vanilla-latte">Vanilla Latte (+$5)</option>
                      <option value="marble">Marble</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-[#541409]/70 mb-1">Filling</label>
                    <select
                      value={formData.cake_filling || ''}
                      onChange={(e) => updateFormData('cake_filling', e.target.value)}
                      className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                    >
                      <option value="">None</option>
                      <option value="chocolate-ganache">Chocolate Ganache (+$10)</option>
                      <option value="cookies-and-cream">Cookies & Cream (+$5)</option>
                      <option value="vanilla-bean-ganache">Vanilla Bean Ganache (+$10)</option>
                      <option value="fresh-strawberries">Fresh Strawberries (+$8)</option>
                      <option value="lemon-ganache">Lemon Ganache (+$5)</option>
                      <option value="raspberry">Raspberry (+$8)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-[#541409]/70 mb-1">Message Style</label>
                    <select
                      value={formData.message_style || ''}
                      onChange={(e) => updateFormData('message_style', e.target.value)}
                      className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                    >
                      <option value="">Select</option>
                      <option value="piped">Piped</option>
                      <option value="piped-cursive">Piped Cursive</option>
                      <option value="block">Block</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#541409]/70 mb-1">Base Color</label>
                  <input
                    type="text"
                    value={formData.base_color || ''}
                    onChange={(e) => updateFormData('base_color', e.target.value)}
                    className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#541409]/70 mb-1">Piping Colors</label>
                  <input
                    type="text"
                    value={formData.piping_colors || ''}
                    onChange={(e) => updateFormData('piping_colors', e.target.value)}
                    className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#541409]/70 mb-1">Custom Messaging</label>
                  <input
                    type="text"
                    value={formData.custom_messaging || ''}
                    onChange={(e) => updateFormData('custom_messaging', e.target.value)}
                    className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#541409]/70 mb-1">Cake Design Notes</label>
                  <textarea
                    value={formData.cake_design_notes || ''}
                    onChange={(e) => updateFormData('cake_design_notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#541409]/70 mb-2">Toppings</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CAKE_TOPPINGS.map((topping) => (
                      <label key={topping.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={toppings.includes(topping.value)}
                          onChange={(e) => updateToppings(topping.value, e.target.checked)}
                          className="w-4 h-4 text-[#541409] border-[#EAD6D6] rounded focus:ring-[#541409]"
                        />
                        <span className="text-sm text-[#541409]">{topping.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wedding Cookie Details */}
          {['cookies', 'cake_and_cookies'].includes(formData.services_needed || '') && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
              <h2 className="font-semibold text-[#541409] mb-4">Cookie Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#541409]/70 mb-1">Quantity (dozen)</label>
                  <select
                    value={formData.cookie_quantity || ''}
                    onChange={(e) => updateFormData('cookie_quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                  >
                    <option value="">Select</option>
                    {[4,5,6,7,8,9,10,11,12,15,20].map(n => (
                      <option key={n} value={n}>{n} Dozen{n >= 10 ? ' (5% off!)' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#541409]/70 mb-2">Flavors (count per flavor)</label>
                  <div className="space-y-2">
                    {COOKIE_FLAVORS.map((flavor) => (
                      <div key={flavor.key} className="flex items-center justify-between">
                        <span className="text-[#541409]">{flavor.label}</span>
                        <input
                          type="number"
                          min="0"
                          step="12"
                          value={cookieFlavors[flavor.key] || 0}
                          onChange={(e) => updateCookieFlavor(flavor.key, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-[#EAD6D6] rounded text-center text-[#541409]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#541409]/70 mb-1">Packaging</label>
                  <select
                    value={formData.cookie_packaging || ''}
                    onChange={(e) => updateFormData('cookie_packaging', e.target.value)}
                    className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                  >
                    <option value="">Select</option>
                    <option value="standard">Standard</option>
                    <option value="heat-sealed">Individually Heat Sealed (+$5/dozen)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Payment */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
        <h2 className="font-semibold text-[#541409] mb-4">Payment</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">Total Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#541409]/70 mb-1">Deposit Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
            />
          </div>
        </div>
      </div>

      {/* Customer Notes */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
        <h2 className="font-semibold text-[#541409] mb-4">Customer Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Notes from the customer..."
          className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2.5 border border-[#EAD6D6] text-[#541409] rounded-lg hover:bg-[#EAD6D6]/20 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
