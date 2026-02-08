'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Are your products really 100% gluten-free?',
    answer: 'Absolutely! Every single product I make is 100% gluten-free and celiac-safe. I use only certified gluten-free ingredients and my recipes are developed and tested specifically for gluten-free baking. You can enjoy my treats with complete confidence!',
  },
  {
    question: 'Do you accommodate other allergies?',
    answer: 'I can accommodate some allergies on a case-by-case basis. Please mention any allergies in your order form and I\'ll let you know if I can work around them. Common allergens in my kitchen include dairy, eggs, nuts, and soy.',
  },
  {
    question: 'How far in advance should I order?',
    answer: 'For cookies, please order at least 1 week in advance. For cakes, I recommend 2 weeks notice. For wedding orders or large events, please reach out at least 4-6 weeks ahead to ensure availability.',
  },
  {
    question: 'Do you deliver?',
    answer: 'All orders are pickup only in Cincinnati, Ohio unless delivery is arranged for weddings or events. I\'ll provide the address once your order is confirmed.',
  },
  {
    question: 'What forms of payment do you accept?',
    answer: 'I accept credit cards, Venmo, PayPal, Apple Pay, and Cash App.',
  },
  {
    question: 'Can I customize my order?',
    answer: 'Absolutely! I love creating custom designs. For cakes, share your vision and inspiration photos. For cookies, you can mix and match flavors. Just include details in the order form.',
  },
  {
    question: 'How should I store my order?',
    answer: 'Cookies are best stored at room temperature in an airtight container and enjoyed within 5 days. Cakes should be refrigerated if they have perishable fillings, but brought to room temperature before serving for the best taste.',
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'Cancellations made more than 7 days before pickup forfeit the deposit. Cancellations within 7 days forfeit full payment. Please see my full Policies page for details.',
  },
  {
    question: 'Do you offer tastings?',
    answer: 'Yes! I offer tasting boxes for couples planning wedding desserts. Cake tasting boxes include 4 flavors with fillings, and cookie boxes include 4 flavors (2 of each). If you book within 30 days, the tasting fee is credited to your order.',
  },
];

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-stone-200">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between text-left"
      >
        <span className="font-medium text-[#541409] pr-8">{item.question}</span>
        <span className={`text-[#541409] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="pb-6 text-stone-600 leading-relaxed">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      {/* Hero Banner */}
      <section
        className="py-16 sm:py-20"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            #F7F3ED 0px,
            #F7F3ED 40px,
            #EAD6D6 40px,
            #EAD6D6 80px
          )`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif text-[#541409] font-bold">
            FAQ
          </h1>
          <p className="mt-4 text-lg text-[#541409]/80">
            Answers to common questions
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
            {faqs.map((faq, index) => (
              <FAQAccordion
                key={index}
                item={faq}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section
        className="py-16 sm:py-24"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            #F7F3ED 0px,
            #F7F3ED 40px,
            #EAD6D6 40px,
            #EAD6D6 80px
          )`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#541409] mb-4">
            Still Have Questions?
          </h2>
          <p className="text-lg text-[#541409]/80 mb-8">
            I'm happy to help! Reach out and I'll get back to you as soon as I can.
          </p>
          <Link
            href="/contact"
            className="inline-flex px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
          >
            Contact Me
          </Link>
        </div>
      </section>
    </>
  );
}
