'use client';

import { useState, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      const url = search
        ? `/api/admin/customers?search=${encodeURIComponent(search)}`
        : '/api/admin/customers';
      const response = await fetch(url);
      const data = await response.json() as { customers?: Customer[] };
      setCustomers(data.customers || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    });
    setEditingCustomer(null);
    setShowForm(false);
    setError(null);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      notes: customer.notes || '',
    });
    setShowForm(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = '/api/admin/customers';
      const method = editingCustomer ? 'PATCH' : 'POST';
      const body = editingCustomer
        ? { id: editingCustomer.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json() as { success?: boolean; error?: string };

      if (data.success) {
        resetForm();
        fetchCustomers();
      } else {
        setError(data.error || 'Failed to save customer');
      }
    } catch {
      setError('Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      await fetch(`/api/admin/customers?id=${id}`, { method: 'DELETE' });
      fetchCustomers();
    } catch (err) {
      console.error('Failed to delete customer:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#541409]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-[#541409]">Customers</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity"
        >
          {showForm && !editingCustomer ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409] placeholder:text-[#541409]/50"
        />
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-[#EAD6D6]">
          <h2 className="font-semibold text-[#541409] mb-4">
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Full name"
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#541409]/70 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#541409]/70 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any notes about this customer (preferences, allergies, etc.)"
                rows={3}
                className="w-full px-3 py-2 border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none text-[#541409] resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingCustomer ? 'Save Changes' : 'Add Customer'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-[#EAD6D6] text-[#541409] rounded-lg hover:bg-[#EAD6D6]/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customers List */}
      {customers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-[#541409]/60 border border-[#EAD6D6]">
          <p>{search ? 'No customers found matching your search.' : 'No customers yet.'}</p>
          <p className="text-sm mt-1">
            {search ? 'Try a different search term.' : 'Add your first customer to get started.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {customers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-xl shadow-sm p-4 border border-[#EAD6D6]">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-[#541409]">{customer.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="px-2.5 py-1 text-xs bg-[#EAD6D6] text-[#541409] rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCustomer(customer.id)}
                      className="px-2.5 py-1 text-xs bg-red-50 text-red-600 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  {customer.email && (
                    <a href={`mailto:${customer.email}`} className="block text-[#541409]/70">{customer.email}</a>
                  )}
                  {customer.phone && (
                    <a href={`tel:${customer.phone}`} className="block text-[#541409]/70">{customer.phone}</a>
                  )}
                  {customer.notes && (
                    <p className="text-[#541409]/50 text-xs mt-1">{customer.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-[#EAD6D6] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#EAD6D6]/30 border-b border-[#EAD6D6]">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-[#541409]">Name</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-[#541409]">Email</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-[#541409]">Phone</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-[#541409]">Address</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-[#541409]">Notes</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-[#541409]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAD6D6]">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-[#EAD6D6]/10 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-[#541409]">{customer.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        {customer.email ? (
                          <a href={`mailto:${customer.email}`} className="text-[#541409] hover:underline">
                            {customer.email}
                          </a>
                        ) : (
                          <span className="text-[#541409]/40">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {customer.phone ? (
                          <a href={`tel:${customer.phone}`} className="text-[#541409] hover:underline">
                            {customer.phone}
                          </a>
                        ) : (
                          <span className="text-[#541409]/40">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#541409]/70 max-w-xs truncate block">
                          {customer.address || <span className="text-[#541409]/40">-</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#541409]/70 max-w-xs truncate block">
                          {customer.notes || <span className="text-[#541409]/40">-</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="px-3 py-1.5 text-sm bg-[#EAD6D6] text-[#541409] rounded-lg hover:bg-[#EAD6D6]/70 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCustomer(customer.id)}
                            className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Summary */}
      {customers.length > 0 && (
        <div className="mt-4 text-sm text-[#541409]/60">
          {customers.length} customer{customers.length !== 1 ? 's' : ''} total
        </div>
      )}
    </div>
  );
}
