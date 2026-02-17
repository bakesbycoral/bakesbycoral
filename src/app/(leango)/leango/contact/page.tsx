'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ContentHero, Section, SectionHeader } from '@/components/leango';
import content from '@/../content/leango/contact.json';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tenantId: 'leango',
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', company: '', phone: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      {/* Hero */}
      <ContentHero
        label={content.hero.label}
        title={content.hero.title}
        description={content.hero.description}
        variant="dark"
      />

      {/* Contact Form & Info */}
      <Section background="darker">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <SectionHeader title={content.form.title} className="mb-8" dark />

            {status === 'success' ? (
              <div className="bg-[#66d200]/10 border border-[#66d200]/20 rounded-2xl p-6 text-[#66d200]">
                {content.form.success}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    {content.form.fields.name} *
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
                    {content.form.fields.email} *
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
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">
                      {content.form.fields.company} *
                    </label>
                    <input
                      type="text"
                      id="company"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00a1f1] focus:border-[#00a1f1] transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                      {content.form.fields.phone}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00a1f1] focus:border-[#00a1f1] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    {content.form.fields.message} *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00a1f1] focus:border-[#00a1f1] transition-colors"
                  />
                </div>

                {status === 'error' && (
                  <div className="text-red-400 text-sm">
                    Something went wrong. Please try again.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full px-6 py-4 bg-[#00a1f1] text-white font-semibold rounded-xl hover:bg-[#0091d8] hover:shadow-lg hover:shadow-[#00a1f1]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? 'Sending...' : content.form.submit}
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div>
            <SectionHeader title={content.info.title} className="mb-8" dark />

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00a1f1]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#00a1f1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{content.info.email.label}</h3>
                  <a href={`mailto:${content.info.email.value}`} className="text-white hover:text-[#00a1f1] transition-colors">
                    {content.info.email.value}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00a1f1]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#00a1f1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{content.info.phone.label}</h3>
                  <a href={`tel:${content.info.phone.value}`} className="text-white hover:text-[#00a1f1] transition-colors">
                    {content.info.phone.value}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00a1f1]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#00a1f1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{content.info.location.label}</h3>
                  <p className="text-white">{content.info.location.value}</p>
                </div>
              </div>
            </div>

            {/* Schedule CTA */}
            <div className="mt-12 bg-gradient-to-br from-[#00a1f1]/20 to-[#66d200]/10 rounded-2xl p-6 border border-[#00a1f1]/20">
              <h3 className="text-lg font-semibold text-white">{content.schedule.title}</h3>
              <p className="mt-2 text-gray-400">{content.schedule.description}</p>
              <Link
                href="/leango/book/consultation"
                className="inline-flex items-center gap-2 mt-4 text-[#00a1f1] font-medium hover:text-[#00a1f1]/80 transition-colors"
              >
                {content.schedule.cta.label}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
