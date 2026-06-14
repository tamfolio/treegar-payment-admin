import React, { useState, useEffect } from 'react';
import { useWriteOffOverdraft } from '../../hooks/overdraftHooks';

const WriteOffConfirmModal = ({ account, onClose }) => {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const writeOffMutation = useWriteOffOverdraft();

  useEffect(() => {
    if (account) {
      setConfirmText('');
      setError('');
    }
  }, [account]);

  if (!account) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (confirmText !== 'WRITE OFF') {
      setError('Type WRITE OFF to confirm');
      return;
    }

    setError('');
    writeOffMutation.mutate(account.customerId, {
      onSuccess: (data) => {
        if (data?.success === false) {
          setError(data.message || 'Failed to write off');
          return;
        }
        onClose();
      },
      onError: (err) => {
        setError(err?.response?.data?.message || err.message || 'Failed to write off');
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-red-700">Write Off Overdraft</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm">
            <p className="font-medium text-red-900 mb-1">⚠️ This action cannot be undone</p>
            <p className="text-xs text-red-700">
              The outstanding balance will be removed from the customer's account as a loss.
            </p>
          </div>

          <div className="bg-gray-50 rounded-md p-3 text-sm">
            <p className="font-medium text-gray-900">{account.customerName}</p>
            <p className="text-xs text-gray-500">{account.customerEmail}</p>
            <p className="text-xs text-gray-400 mt-1">
              Outstanding: ₦{parseFloat(account.outstandingBalance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Type <span className="font-mono font-bold text-red-700">WRITE OFF</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="WRITE OFF"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={writeOffMutation.isPending}
              autoFocus
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={writeOffMutation.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={writeOffMutation.isPending || confirmText !== 'WRITE OFF'}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {writeOffMutation.isPending ? 'Writing off...' : 'Write Off'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteOffConfirmModal;