import React, { useState } from 'react';
import { useLoanRepayment } from '../../hooks/customerHooks';

const fmt = (v) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(v);

const LoanRepaymentModal = ({ isOpen, onClose, customer, customerId }) => {
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  const repaymentMutation = useLoanRepayment();

  const handleClose = () => {
    setAmount('');
    setNarration('');
    setSuccessData(null);
    setError('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError('Enter a valid repayment amount'); return; }
    if (!narration.trim()) { setError('Narration is required'); return; }
    setError('');

    repaymentMutation.mutate(
      { customerId: Number(customerId), amount: amt, narration: narration.trim() },
      {
        onSuccess: (data) => {
          if (data?.success === false) {
            setError(data.message || 'Repayment failed');
            return;
          }
          setSuccessData(data);
        },
        onError: (err) => {
          setError(
            err?.response?.data?.message ||
            err?.response?.data?.errors?.[0] ||
            err?.message ||
            'Failed to record repayment'
          );
        },
      }
    );
  };

  if (!isOpen) return null;

  const name = customer?.businessName || `${customer?.firstName} ${customer?.lastName}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Record Loan Repayment</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success state */}
        {successData ? (
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium text-green-800">
                {successData.message || 'Loan repayment recorded successfully'}
              </p>
            </div>

            <dl className="space-y-3 text-sm border border-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <dt className="text-gray-500">Reference</dt>
                <dd className="font-mono text-xs text-gray-900 font-medium">{successData.data?.reference}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-gray-500">Amount</dt>
                <dd className="font-semibold text-gray-900">{fmt(successData.data?.amount)}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-gray-500">Wallet Balance After</dt>
                <dd className="font-semibold text-gray-900">{fmt(successData.data?.walletBalanceAfter)}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-gray-500">Processed At</dt>
                <dd className="text-gray-600 text-xs">{new Date(successData.data?.processedAt).toLocaleString()}</dd>
              </div>
            </dl>

            <button
              onClick={handleClose}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
            {/* Customer info */}
            <div className="p-3 bg-gray-50 rounded-md text-sm">
              <p className="font-medium text-gray-900">{name}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{customer?.customerCode}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₦)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={repaymentMutation.isPending}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Narration</label>
              <input
                type="text"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="e.g. Loan repayment for November"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={repaymentMutation.isPending}
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex space-x-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                disabled={repaymentMutation.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={repaymentMutation.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90 disabled:opacity-50"
              >
                {repaymentMutation.isPending ? 'Recording...' : 'Record Repayment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoanRepaymentModal;
