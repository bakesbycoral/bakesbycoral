'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EasterPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('easter-popup-dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem('easter-popup-dismissed', '1');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-[#D4E8F0] rounded-2xl shadow-2xl max-w-md w-full p-8 pt-10 text-center overflow-hidden"
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

        {/* Chick hatching from egg */}
        <div className="mb-5 flex justify-center">
          <svg width="80" height="90" viewBox="0 0 80 90" fill="none">
            {/* Chick body */}
            <ellipse cx="40" cy="42" rx="18" ry="16" fill="#FFD966" />
            {/* Wings */}
            <path d="M22 38 Q14 35 18 45 Q22 42 24 40Z" fill="#F6C645" />
            <path d="M58 38 Q66 35 62 45 Q58 42 56 40Z" fill="#F6C645" />
            {/* Chick head */}
            <circle cx="40" cy="26" r="14" fill="#FFD966" />
            {/* Eyes */}
            <circle cx="35" cy="24" r="2" fill="#541409" />
            <circle cx="45" cy="24" r="2" fill="#541409" />
            {/* Beak */}
            <path d="M38 28 L40 32 L42 28" fill="#F0A870" />
            {/* Cheeks */}
            <circle cx="31" cy="28" r="3" fill="#FFB8C6" opacity="0.5" />
            <circle cx="49" cy="28" r="3" fill="#FFB8C6" opacity="0.5" />
            {/* Egg shell bottom half - on top of chick body */}
            <path d="M12 55 Q12 78 40 82 Q68 78 68 55 L63 48 L58 54 L52 46 L46 52 L40 45 L34 52 L28 46 L22 54 L17 48 Z" fill="white" stroke="#D1D5DB" strokeWidth="1.5" />
          </svg>
        </div>

        <span className="inline-block px-4 py-1.5 bg-[#541409] text-[#EAD6D6] text-sm font-medium rounded-full mb-4">
          Limited Time
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#541409] mb-3">
          Easter Collection
        </h2>
        <p className="text-[#541409]/70 mb-6">
          Bento cakes, cookie cakes &amp; thumbprint confetti cookies — perfect for Easter celebrations! Order individually or save with a bundle.
        </p>
        <Link
          href="/collection/easter"
          onClick={handleClose}
          className="inline-flex px-8 py-3 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity"
        >
          View Collection &amp; Order
        </Link>
      </div>
    </div>
  );
}
