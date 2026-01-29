'use client';

import { useEffect } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  autoCloseMs?: number;
}

export function SuccessModal({
  isOpen,
  onClose,
  title = 'Success!',
  message,
  autoCloseMs = 3000,
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen && autoCloseMs > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#FFF8F0] rounded-2xl shadow-xl p-8 max-w-sm w-full text-center animate-in fade-in zoom-in duration-200">
        {/* Checkmark Icon */}
        <div className="w-16 h-16 bg-[#EAD6D6] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#541409]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[#541409] mb-2">{title}</h3>

        {/* Message */}
        <p className="text-[#541409]/80 mb-6">{message}</p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="px-6 py-2 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
