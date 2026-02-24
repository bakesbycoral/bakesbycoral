'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ContractStatusBadge } from './ContractStatusBadge';
import type { Contract, ContractStatus } from '@/types';

interface ContractBuilderProps {
  orderId: string;
  contract?: Contract;
  onClose: () => void;
}

export function ContractBuilder({ orderId, contract, onClose }: ContractBuilderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [contractId, setContractId] = useState<string | null>(contract?.id || null);
  const [contractNumber, setContractNumber] = useState(contract?.contract_number || '');
  const [status, setStatus] = useState<ContractStatus>(contract?.status || 'draft');

  // Contract terms
  const [contractBody, setContractBody] = useState(contract?.contract_body || '');

  // Notes & valid until
  const [notes, setNotes] = useState(contract?.notes || '');
  const [validUntil, setValidUntil] = useState(
    contract?.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const isEditable = status === 'draft' || status === 'sent';

  // Create contract if new
  useEffect(() => {
    if (!contractId) {
      createContract();
    }
  }, []);

  const createContract = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      });

      const data = await response.json() as {
        success?: boolean;
        error?: string;
        contract?: { id: string; contract_number: string };
      };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create contract');
      }

      if (data.contract) {
        setContractId(data.contract.id);
        setContractNumber(data.contract.contract_number);

        // Fetch the created contract to get pre-populated data
        const fetchResponse = await fetch(`/api/admin/contracts/${data.contract.id}`);
        const fetchData = await fetchResponse.json() as { contract?: Contract };
        if (fetchData.contract) {
          const c = fetchData.contract;
          setContractBody(c.contract_body || '');
          setValidUntil(c.valid_until || validUntil);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contract');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contractId) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/contracts/${contractId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_body: contractBody || null,
          notes: notes || null,
          valid_until: validUntil,
        }),
      });

      const data = await response.json() as { success?: boolean; error?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save contract');
      }

      setSuccess('Contract saved successfully');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contract');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    if (!contractId) return;

    if (!contractBody.trim()) {
      setError('Please add contract terms before sending');
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
      // Save first
      await handleSave();

      // Then send
      const response = await fetch(`/api/admin/contracts/${contractId}/send`, {
        method: 'POST',
      });

      const data = await response.json() as { success?: boolean; error?: string; contractUrl?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send contract');
      }

      setStatus('sent');
      setSuccess('Contract sent to customer!');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send contract');
    } finally {
      setIsSending(false);
    }
  };

  const handleResetToDefault = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json() as { settings?: Array<{ key: string; value: string }> };
      const defaultBody = data.settings?.find((s: { key: string }) => s.key === 'default_contract_body');
      if (defaultBody) {
        setContractBody(defaultBody.value);
      }
    } catch {
      setError('Failed to load default template');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#541409] mx-auto"></div>
        <p className="mt-4 text-[#541409]/60">Creating contract...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#EAD6D6]">
      {/* Header */}
      <div className="p-6 border-b border-[#EAD6D6] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#541409]">
            {contractNumber ? `Contract ${contractNumber}` : 'New Contract'}
          </h2>
          {status && <ContractStatusBadge status={status} />}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Contract Terms */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-[#541409]">Contract Terms</h3>
            <div className="flex items-center gap-2">
              {isEditable && (
                <button
                  onClick={handleResetToDefault}
                  className="text-sm text-[#541409]/70 hover:text-[#541409] underline"
                >
                  Reset to Default
                </button>
              )}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-[#541409]/70 hover:text-[#541409]"
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
          </div>

          {showPreview ? (
            <div className="border border-[#EAD6D6] rounded-lg p-4 bg-white min-h-[300px] whitespace-pre-wrap text-[#541409]/80 text-sm font-mono">
              {contractBody}
            </div>
          ) : (
            <textarea
              id="contract-body-editor"
              value={contractBody}
              onChange={(e) => setContractBody(e.target.value)}
              rows={20}
              disabled={!isEditable}
              placeholder="Enter contract terms..."
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none disabled:bg-gray-100 resize-none font-mono text-sm text-[#541409]/50 placeholder:text-[#541409]/50"
            />
          )}
        </div>

        {/* Internal Notes */}
        <div>
          <label className="block text-sm font-medium text-[#541409] mb-1">Internal Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Notes for your reference (not shown to customer)..."
            className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none resize-none text-[#541409]/50 placeholder:text-[#541409]/50"
          />
        </div>

        {/* Valid Until */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#541409] mb-1">Valid Until</label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              disabled={!isEditable}
              className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none disabled:bg-gray-100 text-[#541409]/50 placeholder:text-[#541409]/50"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-[#EAD6D6] flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-[#541409] border border-[#EAD6D6] rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        {isEditable && (
          <>
            <button
              onClick={handleSave}
              disabled={isSaving || isSending}
              className="px-4 py-2 bg-[#EAD6D6] text-[#541409] rounded-lg hover:bg-[#EAD6D6]/70 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSend}
              disabled={isSaving || isSending || !contractBody.trim()}
              className="px-4 py-2 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSending ? 'Sending...' : status === 'sent' ? 'Resend Contract' : 'Send Contract'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
