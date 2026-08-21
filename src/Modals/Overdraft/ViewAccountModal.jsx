import React from 'react';
import { useOverdraftAccount } from '../../hooks/overdraftHooks';

const formatCurrency = (v) =>
  v != null
    ? new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 2,
      }).format(v)
    : '—';

const formatDate = (v) =>
  v
    ? new Date(v).toLocaleString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const StatusBadge = ({ status }) => {
  const map = {
    active: 'bg-green-100 text-green-800',
    watchlisted: 'bg-yellow-100 text-yellow-800',
    nonperforming: 'bg-orange-100 text-orange-800',
    collections: 'bg-red-100 text-red-800',
    writtenoff: 'bg-gray-200 text-gray-700',
  };
  if (!status) return <span className="text-gray-300 text-xs">—</span>;
  const cls = map[status.toLowerCase()] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
};

const Row = ({ label, value, highlight }) => (
  <div className={`flex justify-between items-start py-2.5 border-b border-gray-100 last:border-b-0 ${highlight ? 'bg-amber-50 -mx-3 px-3 rounded' : ''}`}>
    <span className="text-xs font-medium text-gray-500">{label}</span>
    <span className={`text-sm text-right max-w-[60%] break-words ${highlight ? 'font-semibold text-gray-900' : 'text-gray-900'}`}>
      {value ?? '—'}
    </span>
  </div>
);

const ViewAccountModal = ({ customerId, onClose }) => {
  const { data, isLoading, error } = useOverdraftAccount(customerId);

  if (!customerId) return null;

  const account = data?.data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Overdraft Account Detail</h3>
            <p className="text-xs text-gray-500 mt-0.5">Customer ID: {customerId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-6 w-6 text-primary mr-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-gray-500">Loading account details...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm">
              <p className="font-medium text-red-800">Failed to load account</p>
              <p className="text-xs text-red-600 mt-1">{error?.message || 'An unexpected error occurred.'}</p>
            </div>
          ) : !account ? (
            <p className="text-sm text-gray-500 text-center py-8">No account data found.</p>
          ) : (
            <>
              {/* Status */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
                <StatusBadge status={account.status} />
              </div>

              {/* Customer */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer</h4>
                <Row label="Name" value={account.customerName} />
                <Row label="Email" value={account.customerEmail} />
                <Row label="Customer ID" value={account.customerId} />
                <Row label="Wallet ID" value={account.walletId} />
              </div>

              {/* Balances */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Balances</h4>
                <Row label="Overdraft Limit" value={formatCurrency(account.overdraftLimit)} />
                <Row label="Headroom Available" value={formatCurrency(account.headroomAvailable)} />
                <Row label="Outstanding Balance" value={formatCurrency(account.outstandingBalance)} />
                <Row label="Accrued Fees" value={formatCurrency(account.accruedFees)} />
                <Row label="Accrued Interest" value={formatCurrency(account.accruedInterest)} />
                <Row label="Total Amount Owed" value={formatCurrency(account.totalAmountOwed)} highlight />
              </div>

              {/* Rate & Overdrawn Info */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Interest & Overdrawn</h4>
                <Row
                  label="Daily Interest Rate"
                  value={account.dailyInterestRate != null ? `${(account.dailyInterestRate * 100).toFixed(4)}%/day` : '—'}
                />
                <Row label="Days Overdrawn" value={account.daysOverdrawn ?? 0} />
                <Row label="Overdrawn Since" value={formatDate(account.overdrawnSince)} />
                <Row label="Last Interest Accrued" value={formatDate(account.lastInterestAccruedAt)} />
              </div>

              {/* Timestamps */}
              <div className="mb-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Timestamps</h4>
                <Row label="Created" value={formatDate(account.createdAt)} />
                <Row label="Last Updated" value={formatDate(account.updatedAt)} highlight />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAccountModal;
