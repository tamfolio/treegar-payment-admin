import React, { useState, useEffect } from 'react';
import { useApproveOverdraftApplication } from '../../hooks/overdraftHooks';

const ApproveApplicationModal = ({ application, onClose }) => {
  const [overdraftLimit, setOverdraftLimit] = useState('');
  const [dailyInterestRate, setDailyInterestRate] = useState('');
  const [error, setError] = useState('');

  const approveMutation = useApproveOverdraftApplication();

  useEffect(() => {
    if (application) {
      setOverdraftLimit('');
      setDailyInterestRate('');
      setError('');
    }
  }, [application]);

  if (!application) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const limit = parseFloat(overdraftLimit);
    const rate = parseFloat(dailyInterestRate);

    if (!limit || limit <= 0) {
      setError('Enter a valid overdraft limit');
      return;
    }
    if (isNaN(rate) || rate < 0 || rate > 1) {
      setError('Daily interest rate must be between 0 and 1 (e.g. 0.0015 for 0.15%)');
      return;
    }

    setError('');
    approveMutation.mutate(
      {
        applicationId: application.id,
        overdraftLimit: limit,
        dailyInterestRate: rate,
      },
      {
        onSuccess: (data) => {
          if (data?.success === false) {
            setError(data.message || 'Failed to approve application');
            return;
          }
          onClose();
        },
        onError: (err) => {
          setError(err?.response?.data?.message || err.message || 'Failed to approve');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Approve Application</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="bg-gray-50 rounded-md p-3 text-sm">
            <p className="font-medium text-gray-900">{application.customerName}</p>
            <p className="text-xs text-gray-500">{application.customerEmail}</p>
            <p className="text-xs text-gray-400 mt-1">Application ID: {application.id}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Overdraft Limit (₦)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={overdraftLimit}
              onChange={(e) => setOverdraftLimit(e.target.value)}
              placeholder="e.g. 500000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={approveMutation.isPending}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Daily Interest Rate <span className="text-gray-400 font-normal">(decimal, e.g. 0.0015 = 0.15%)</span>
            </label>
            <input
              type="number"
              step="0.0001"
              min="0"
              max="1"
              value={dailyInterestRate}
              onChange={(e) => setDailyInterestRate(e.target.value)}
              placeholder="e.g. 0.0015"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={approveMutation.isPending}
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={approveMutation.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={approveMutation.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {approveMutation.isPending ? 'Approving...' : 'Approve'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApproveApplicationModal;