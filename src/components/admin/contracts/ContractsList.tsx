'use client';

import { useState, useEffect } from 'react';
import { ContractStatusBadge } from './ContractStatusBadge';
import { ContractBuilder } from './ContractBuilder';
import type { Contract } from '@/types';

interface ContractWithDetails extends Contract {
  order_order_number?: string;
  customer_name?: string;
}

interface ContractsListProps {
  orderId: string;
  orderStatus: string;
}

export function ContractsList({ orderId, orderStatus }: ContractsListProps) {
  const [contracts, setContracts] = useState<ContractWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<ContractWithDetails | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, [orderId]);

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/contracts?order_id=${orderId}`);
      const data = await response.json() as { contracts?: ContractWithDetails[] };
      setContracts(data.contracts || []);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectContract = async (contractId: string) => {
    try {
      const response = await fetch(`/api/admin/contracts/${contractId}`);
      const data = await response.json() as { contract?: ContractWithDetails };
      setSelectedContract(data.contract || null);
    } catch (error) {
      console.error('Failed to fetch contract:', error);
    }
  };

  const handleDelete = async (contractId: string, contractNumber: string) => {
    if (!confirm(`Delete contract ${contractNumber}? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/admin/contracts/${contractId}`, { method: 'DELETE' });
      const data = await response.json() as { error?: string };
      if (!response.ok) {
        alert(data.error || 'Failed to delete contract');
        return;
      }
      fetchContracts();
    } catch {
      alert('Failed to delete contract');
    }
  };

  const handleClose = () => {
    setSelectedContract(null);
    setIsCreating(false);
    fetchContracts();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (cents: number | null) => {
    if (cents === null) return '-';
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Show builder if creating or editing
  if (isCreating || selectedContract) {
    return (
      <ContractBuilder
        orderId={orderId}
        contract={selectedContract || undefined}
        onClose={handleClose}
      />
    );
  }

  const canCreateContract = ['inquiry', 'pending_payment', 'deposit_paid'].includes(orderStatus);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#541409]">Wedding Contracts</h2>
        {canCreateContract && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-3 py-1.5 text-sm bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Contract
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#541409] mx-auto"></div>
        </div>
      ) : contracts.length === 0 ? (
        <div className="py-8 text-center text-[#541409]/60">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No contracts yet</p>
          {canCreateContract && (
            <button
              onClick={() => setIsCreating(true)}
              className="mt-3 text-sm text-[#541409] hover:underline"
            >
              Create the first contract
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="p-4 border border-[#EAD6D6] rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#541409]">{contract.contract_number}</span>
                    <ContractStatusBadge status={contract.status} />
                  </div>
                  <div className="mt-1 text-sm text-[#541409]/60">
                    Created {formatDate(contract.created_at)}
                    {contract.event_date && ` • Event: ${formatDate(contract.event_date)}`}
                    {contract.valid_until && ` • Valid until ${formatDate(contract.valid_until)}`}
                  </div>
                  {contract.signed_at && (
                    <div className="mt-1 text-sm text-green-600">
                      Signed by {contract.signer_name} on {formatDate(contract.signed_at)}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#541409]">
                    {formatCurrency(contract.total_amount)}
                  </div>
                  {contract.deposit_amount ? (
                    <div className="text-sm text-[#541409]/60">
                      Deposit: {formatCurrency(contract.deposit_amount)}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => handleSelectContract(contract.id)}
                  className="px-3 py-1.5 text-sm bg-[#EAD6D6] text-[#541409] rounded-lg hover:bg-[#EAD6D6]/70 transition-colors"
                >
                  {contract.status === 'draft' || contract.status === 'sent' ? 'Edit' : 'View'}
                </button>
                {contract.status !== 'signed' && (
                  <button
                    onClick={() => handleDelete(contract.id, contract.contract_number)}
                    className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
