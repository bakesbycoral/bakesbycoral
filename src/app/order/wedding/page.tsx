'use client';

import { useEffect, useState } from 'react';
import { Container, Section, PageHeader } from '@/components/layout';
import { Button } from '@/components/ui';
import { Input, Textarea, Select, Checkbox, FormSection, FormError, Honeypot, TimeSlotPicker } from '@/components/forms';

const weddingServices = [
  { value: 'cake', label: 'Wedding Cake' },
  { value: 'dessert_table', label: 'Dessert Table' },
  { value: 'cookie_favors', label: 'Cookie Favors' },
  { value: 'cake_and_desserts', label: 'Cake + Desserts' },
  { value: 'full_package', label: 'Full Package (Cake, Desserts, Favors)' },
];

const guestCountRanges = [
  { value: '25-50', label: '25-50 guests' },
  { value: '50-100', label: '50-100 guests' },
  { value: '100-150', label: '100-150 guests' },
  { value: '150-200', label: '150-200 guests' },
  { value: '200+', label: '200+ guests' },
];

const budgetRanges = [
  { value: '300-500', label: '$300 - $500' },
  { value: '500-750', label: '$500 - $750' },
  { value: '750-1000', label: '$750 - $1,000' },
  { value: '1000-1500', label: '$1,000 - $1,500' },
  { value: '1500+', label: '$1,500+' },
];

const cakeTiers = [
  { value: '1', label: 'Single Tier' },
  { value: '2', label: '2 Tiers' },
  { value: '3', label: '3 Tiers' },
  { value: '4+', label: '4+ Tiers' },
];

const cakeFlavors = [
  { value: 'vanilla', label: 'Vanilla' },
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'almond', label: 'Almond' },
  { value: 'lemon', label: 'Lemon' },
  { value: 'mixed', label: 'Mixed (Different flavor per tier)' },
];

export default function WeddingInquiryPage() {
  const [formData, setFormData] = useState({
    // Contact Info
    name: '',
    email: '',
    phone: '',
    partner_name: '',

    // Event Details
    wedding_date: '',
    venue_name: '',
    venue_address: '',
    ceremony_time: '',
    reception_time: '',
    guest_count: '',

    // Services
    services_needed: '',

    // Cake Details
    cake_tiers: '',
    cake_flavor: '',
    cake_design_notes: '',
    cake_inspiration_1: '',
    cake_inspiration_2: '',

    // Dessert Table
    dessert_preferences: '',
    dessert_count: '',

    // Cookie Favors
    favor_count: '',
    favor_packaging: '',
    favor_flavors: '',

    // Additional
    color_palette: '',
    theme: '',
    additional_notes: '',
    dietary_restrictions: '',
    budget_range: '',
    how_found_us: '',

    // Pickup/Delivery
    pickup_or_delivery: 'pickup',
    pickup_slot: null as { date: string; time: string } | null,
    delivery_address: '',
    setup_needed: false,

    // Acknowledgements
    acknowledge_lead_time: false,
    acknowledge_deposit: false,
    acknowledge_allergy: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [minDate, setMinDate] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchMinDate = async () => {
      try {
        const response = await fetch(`/api/slots?start=${todayStr}&type=wedding`);
        const data = await response.json() as { minDate?: string };
        if (data.minDate) setMinDate(data.minDate);
      } catch {
        setMinDate('');
      }
    };
    fetchMinDate();
  }, [todayStr]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.wedding_date) newErrors.wedding_date = 'Wedding date is required';
    if (!formData.guest_count) newErrors.guest_count = 'Guest count is required';
    if (!formData.services_needed) newErrors.services_needed = 'Please select which services you need';
    if (!formData.acknowledge_lead_time) newErrors.acknowledge_lead_time = 'Please acknowledge';
    if (!formData.acknowledge_deposit) newErrors.acknowledge_deposit = 'Please acknowledge';
    if (!formData.acknowledge_allergy) newErrors.acknowledge_allergy = 'Please acknowledge';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders/wedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pickup_date: formData.pickup_slot?.date || null,
          pickup_time: formData.pickup_slot?.time || null,
        }),
      });

      const data = await response.json() as { success?: boolean; error?: string };

      if (data.success) {
        setSubmitted(true);
      } else if (data.error) {
        setErrors({ submit: data.error });
      }
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showCakeFields = ['cake', 'cake_and_desserts', 'full_package'].includes(formData.services_needed);
  const showDessertFields = ['dessert_table', 'cake_and_desserts', 'full_package'].includes(formData.services_needed);
  const showFavorFields = ['cookie_favors', 'full_package'].includes(formData.services_needed);

  if (submitted) {
    return (
      <>
        <PageHeader title="Inquiry Submitted!" />
        <Section>
          <Container size="sm">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Thank You!</h2>
              <p className="text-neutral-600 mb-6">
                We&apos;ve received your wedding inquiry. We&apos;ll review your request and
                reach out within 48 hours to schedule a consultation.
              </p>
              <p className="text-neutral-500 text-sm mb-8">
                Check your email ({formData.email}) for a confirmation message.
              </p>
              <Button href="/weddings">Back to Weddings Page</Button>
            </div>
          </Container>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Wedding Inquiry"
        subtitle="Tell us about your special day and we'll create a custom dessert experience."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Weddings', href: '/weddings' },
          { label: 'Inquiry' },
        ]}
      />

      <Section>
        <Container size="md">
          <div className="bg-amber-50 rounded-xl p-4 mb-8">
            <p className="text-amber-800 text-sm">
              <strong>Lead time:</strong> Wedding orders require at least 1 month notice. We recommend reaching out 2-3 months in advance for popular dates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Honeypot />

            {errors.submit && <FormError errors={{ submit: errors.submit }} />}

            <FormSection title="Contact Information">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Your Name" name="name" value={formData.name} onChange={handleInputChange} error={errors.name} required />
                <Input label="Partner's Name (Optional)" name="partner_name" value={formData.partner_name} onChange={handleInputChange} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} required />
                <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} error={errors.phone} required />
              </div>
            </FormSection>

            <FormSection title="Wedding Details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Wedding Date" name="wedding_date" type="date" min={minDate || undefined} value={formData.wedding_date} onChange={handleInputChange} error={errors.wedding_date} required />
                <Select label="Estimated Guest Count" name="guest_count" value={formData.guest_count} onChange={handleInputChange} options={guestCountRanges} placeholder="Select range" error={errors.guest_count} required />
              </div>
              <Input label="Venue Name" name="venue_name" value={formData.venue_name} onChange={handleInputChange} />
              <Input label="Venue Address" name="venue_address" value={formData.venue_address} onChange={handleInputChange} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Ceremony Time (Optional)" name="ceremony_time" type="time" value={formData.ceremony_time} onChange={handleInputChange} />
                <Input label="Reception Time (Optional)" name="reception_time" type="time" value={formData.reception_time} onChange={handleInputChange} />
              </div>
            </FormSection>

            <FormSection title="Services Needed">
              <Select
                label="What services are you interested in?"
                name="services_needed"
                value={formData.services_needed}
                onChange={handleInputChange}
                options={weddingServices}
                placeholder="Select services"
                error={errors.services_needed}
                required
              />
            </FormSection>

            {showCakeFields && (
              <FormSection title="Wedding Cake Details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="Number of Tiers" name="cake_tiers" value={formData.cake_tiers} onChange={handleInputChange} options={cakeTiers} placeholder="Select tiers" />
                  <Select label="Cake Flavor" name="cake_flavor" value={formData.cake_flavor} onChange={handleInputChange} options={cakeFlavors} placeholder="Select flavor" />
                </div>
                <Input label="Inspiration Link 1" name="cake_inspiration_1" type="url" value={formData.cake_inspiration_1} onChange={handleInputChange} placeholder="https://pinterest.com/..." helperText="Pinterest, Instagram, or other image links" />
                <Input label="Inspiration Link 2 (Optional)" name="cake_inspiration_2" type="url" value={formData.cake_inspiration_2} onChange={handleInputChange} placeholder="https://..." />
                <Textarea label="Cake Design Notes" name="cake_design_notes" value={formData.cake_design_notes} onChange={handleInputChange} helperText="Describe your vision for the cake - style, decorations, florals, etc." />
              </FormSection>
            )}

            {showDessertFields && (
              <FormSection title="Dessert Table Details">
                <Input label="Approximate Dessert Count" name="dessert_count" value={formData.dessert_count} onChange={handleInputChange} placeholder="e.g., 100 mini desserts" helperText="We can help determine this based on your guest count" />
                <Textarea label="Dessert Preferences" name="dessert_preferences" value={formData.dessert_preferences} onChange={handleInputChange} helperText="What types of desserts would you like? Any favorites or must-haves?" />
              </FormSection>
            )}

            {showFavorFields && (
              <FormSection title="Cookie Favor Details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Number of Favors" name="favor_count" value={formData.favor_count} onChange={handleInputChange} placeholder="e.g., 100" />
                  <Input label="Packaging Preference" name="favor_packaging" value={formData.favor_packaging} onChange={handleInputChange} placeholder="e.g., Clear bags with ribbon" />
                </div>
                <Textarea label="Flavor Preferences" name="favor_flavors" value={formData.favor_flavors} onChange={handleInputChange} helperText="What cookie flavors would you like for your favors?" />
              </FormSection>
            )}

            <FormSection title="Style & Theme">
              <Input label="Color Palette" name="color_palette" value={formData.color_palette} onChange={handleInputChange} placeholder="e.g., Dusty rose, sage green, gold" />
              <Input label="Wedding Theme/Style" name="theme" value={formData.theme} onChange={handleInputChange} placeholder="e.g., Rustic, Modern, Romantic" />
            </FormSection>

            <FormSection title="Additional Information">
              <Textarea label="Dietary Restrictions" name="dietary_restrictions" value={formData.dietary_restrictions} onChange={handleInputChange} helperText="Any allergies or dietary needs we should know about (beyond gluten-free)" />
              <Textarea label="Additional Notes" name="additional_notes" value={formData.additional_notes} onChange={handleInputChange} helperText="Anything else you'd like us to know about your vision" />
              <Select label="Budget Range" name="budget_range" value={formData.budget_range} onChange={handleInputChange} options={budgetRanges} placeholder="Select budget range" />
              <Input label="How did you find us?" name="how_found_us" value={formData.how_found_us} onChange={handleInputChange} placeholder="e.g., Instagram, referral, Google" />
            </FormSection>

            <FormSection title="Pickup Details">
              <p className="text-sm text-neutral-600 mb-4">
                All wedding orders are <strong>pickup only</strong> in Cincinnati. Delivery is not offered at this time.
              </p>
              <TimeSlotPicker
                orderType="wedding"
                value={formData.pickup_slot ?? undefined}
                onChange={(slot) => setFormData({ ...formData, pickup_slot: slot })}
                label="Preferred Pickup Date & Time"
              />
              <p className="mt-1 text-xs text-neutral-500">
                This is your preferred pickup time. We'll confirm final timing during our consultation.
              </p>
            </FormSection>

            <FormSection title="Acknowledgements">
              <div className="space-y-4">
                <Checkbox
                  label="I understand that wedding orders require at least 1 month notice and popular dates may require 2-3 months advance booking."
                  name="acknowledge_lead_time"
                  checked={formData.acknowledge_lead_time}
                  onChange={handleInputChange}
                  error={errors.acknowledge_lead_time}
                />
                <Checkbox
                  label="I understand that a 50% non-refundable deposit is required to secure my date, with final payment due 14 days before the event."
                  name="acknowledge_deposit"
                  checked={formData.acknowledge_deposit}
                  onChange={handleInputChange}
                  error={errors.acknowledge_deposit}
                />
                <Checkbox
                  label="I understand that all products are gluten-free but made in a home kitchen that is not allergen-free."
                  name="acknowledge_allergy"
                  checked={formData.acknowledge_allergy}
                  onChange={handleInputChange}
                  error={errors.acknowledge_allergy}
                />
              </div>
            </FormSection>

            <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
              Submit Wedding Inquiry
            </Button>

            <p className="text-sm text-neutral-500 text-center">
              We&apos;ll review your inquiry and reach out within 48 hours to schedule a consultation.
            </p>
          </form>
        </Container>
      </Section>
    </>
  );
}
