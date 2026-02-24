'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import type { ContractStatus } from '@/types';

interface ContractData {
  id: string;
  contract_number: string;
  status: ContractStatus;
  contract_body: string | null;
  valid_until: string | null;
  signed_at: string | null;
  signer_name: string | null;
  order_number: string;
  customer_name: string;
}

export default function ContractPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [contract, setContract] = useState<ContractData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    fetchContract();
  }, [token]);

  const fetchContract = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/contracts/${token}`);
      const data = await response.json() as { contract?: ContractData; error?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load contract');
      }

      setContract(data.contract || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contract');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    if (!signerName.trim() || !agreed) return;

    setIsSigning(true);
    setError(null);

    try {
      const response = await fetch(`/api/contracts/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signer_name: signerName.trim(),
          agreed: true,
        }),
      });

      const data = await response.json() as { success?: boolean; error?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign contract');
      }

      await fetchContract();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign contract');
      setIsSigning(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#541409] mx-auto"></div>
          <p className="mt-4 text-[#541409]/60">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center border border-[#EAD6D6]">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#541409] mb-2">Contract Not Found</h1>
          <p className="text-[#541409]/60 mb-6">
            {error || 'This contract may have expired or the link is invalid.'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = contract.status === 'expired';
  const isSigned = contract.status === 'signed';
  const canSign = contract.status === 'sent';

  return (
    <div className="min-h-screen bg-[#F7F3ED]">
      {/* Header */}
      <header className="bg-[#541409] text-[#EAD6D6] py-6 print-hidden">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-serif">Bakes by Coral</h1>
          <p className="text-sm opacity-80 mt-1">100% Gluten-Free Home Bakery</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-[#EAD6D6] overflow-hidden print-no-shadow print-no-bg">
          {/* Contract Header */}
          <div className="p-6 border-b border-[#EAD6D6]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#541409]">Wedding Contract</h2>
                <p className="text-[#541409]/60 text-sm mt-1">
                  {contract.contract_number} • Order: {contract.order_number}
                </p>
              </div>
              <div className="text-right">
                {isExpired && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    Expired
                  </span>
                )}
                {isSigned && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Signed
                  </span>
                )}
                {canSign && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
                    Pending Signature
                  </span>
                )}
              </div>
            </div>

            <p className="mt-4 text-[#541409]">Hi {contract.customer_name},</p>
            <p className="text-[#541409]/80 mt-2">
              Please review your wedding contract below.
            </p>
          </div>

          {/* Contract Terms */}
          {contract.contract_body && (
            <div className="p-6 border-b border-[#EAD6D6]">
              <div className="text-sm text-[#541409]/80 whitespace-pre-wrap leading-relaxed">
                {contract.contract_body}
              </div>
            </div>
          )}

          {/* Signature block - visible in print when signed */}
          {isSigned && (
            <div className="p-6 border-b border-[#EAD6D6]">
              <div className="border-t-2 border-[#541409] pt-4 mt-4">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs text-[#541409]/60 uppercase tracking-wide mb-1">Signed By</p>
                    <p className="text-[#541409] font-medium">{contract.signer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#541409]/60 uppercase tracking-wide mb-1">Date Signed</p>
                    <p className="text-[#541409] font-medium">{formatDate(contract.signed_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Valid Until */}
          {contract.valid_until && !isSigned && (
            <div className="px-6 py-3 bg-[#EAD6D6]/20 text-sm text-[#541409]/60">
              This contract is valid until <strong>{formatDate(contract.valid_until)}</strong>
            </div>
          )}

          {/* Actions / Signing */}
          <div className="p-6 bg-[#F7F3ED] border-t border-[#EAD6D6] print-hidden">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {isExpired && (
              <div className="text-center">
                <p className="text-[#541409]/80 mb-4">
                  This contract has expired. Please contact us to request a new contract.
                </p>
                <a
                  href="mailto:hello@bakesbycoral.com"
                  className="inline-block px-6 py-3 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity"
                >
                  Contact Us
                </a>
              </div>
            )}

            {isSigned && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[#541409] font-medium mb-2">Contract Signed!</p>
                <p className="text-[#541409]/60 text-sm mb-2">
                  Signed by {contract.signer_name} on {formatDate(contract.signed_at)}
                </p>
                <p className="text-[#541409]/60 text-sm mb-4">
                  A confirmation email has been sent. We&apos;ll be in touch soon with next steps!
                </p>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print / Save as PDF
                </button>
              </div>
            )}

            {canSign && (
              <div>
                <h3 className="font-semibold text-[#541409] mb-4 text-center">Sign Contract</h3>

                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#541409] mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="Type your full name"
                      className="w-full px-4 py-3 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                    />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#541409] border-[#EAD6D6] rounded focus:ring-[#541409]"
                    />
                    <span className="text-sm text-[#541409]/80">
                      I have read and agree to the terms and conditions outlined in this contract.
                    </span>
                  </label>

                  <button
                    onClick={handleSign}
                    disabled={isSigning || !signerName.trim() || !agreed}
                    className="w-full px-8 py-4 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSigning ? 'Signing...' : 'Sign Contract'}
                  </button>

                  <p className="text-center text-sm text-[#541409]/60">
                    Questions? Email us at{' '}
                    <a href="mailto:hello@bakesbycoral.com" className="text-[#541409] hover:underline">
                      hello@bakesbycoral.com
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-[#541409]/60 print-hidden">
          <p>Bakes by Coral • Cincinnati, OH</p>
          <p className="mt-1">100% Gluten-Free Home Bakery</p>
        </div>
      </main>
    </div>
  );
}
