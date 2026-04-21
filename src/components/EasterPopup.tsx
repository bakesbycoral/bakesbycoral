'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MothersDayPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('mothers-day-popup-dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem('mothers-day-popup-dismissed', '1');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-gradient-to-b from-[#FDF2F8] to-[#F9E8EF] rounded-2xl shadow-2xl max-w-md w-full p-8 pt-10 text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-[#541409]/60 hover:text-[#541409] transition-colors rounded-full hover:bg-white/50 z-10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Flowers */}
        <div className="mb-5 flex justify-center">
          <svg width="80" height="90" viewBox="0 0 80 90" fill="none">
            {/* Stem */}
            <path d="M40 50 L40 85" stroke="#6B8E5A" strokeWidth="3" strokeLinecap="round" />
            <path d="M40 65 Q30 58 25 62" stroke="#6B8E5A" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M40 72 Q50 65 55 69" stroke="#6B8E5A" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Flower petals */}
            <ellipse cx="40" cy="28" rx="8" ry="12" fill="#F9A8C9" opacity="0.8" />
            <ellipse cx="40" cy="28" rx="8" ry="12" fill="#F9A8C9" opacity="0.8" transform="rotate(72 40 28)" />
            <ellipse cx="40" cy="28" rx="8" ry="12" fill="#F9A8C9" opacity="0.8" transform="rotate(144 40 28)" />
            <ellipse cx="40" cy="28" rx="8" ry="12" fill="#F9A8C9" opacity="0.8" transform="rotate(216 40 28)" />
            <ellipse cx="40" cy="28" rx="8" ry="12" fill="#F9A8C9" opacity="0.8" transform="rotate(288 40 28)" />
            {/* Center */}
            <circle cx="40" cy="28" r="6" fill="#F0D060" />
            {/* Small flowers */}
            <circle cx="20" cy="35" r="5" fill="#E8B4C8" opacity="0.7" />
            <circle cx="20" cy="35" r="2" fill="#F0D060" opacity="0.8" />
            <circle cx="60" cy="35" r="5" fill="#E8B4C8" opacity="0.7" />
            <circle cx="60" cy="35" r="2" fill="#F0D060" opacity="0.8" />
          </svg>
        </div>

        <span className="inline-block px-4 py-1.5 bg-[#541409] text-[#EAD6D6] text-sm font-medium rounded-full mb-4">
          Limited Collection
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#541409] mb-3">
          Mother&apos;s Day Collection
        </h2>
        <p className="text-[#541409]/70 mb-6">
          Mini cakes &amp; cookie cups in two matching styles — Floral &amp; Vintage.
          The sweetest way to celebrate Mom!
        </p>
        <Link
          href="/collection/mothers-day"
          onClick={handleClose}
          className="inline-flex px-8 py-3 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
        >
          View Collection &amp; Order
        </Link>
      </div>
    </div>
  );
}
