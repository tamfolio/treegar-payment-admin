import React, { useState, useEffect } from 'react';
import { useRejectOverdraftApplication } from '../../hooks/overdraftHooks';

const RejectApplicationModal = ({ application, onClose }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const rejectMutation = useRejectOverdraftApplication();

  useEffect(() => {
    if (application) {
      setRejectionReason('');
      setError('');
    }
  }, [application]);

  if (!application) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setError('Please provide a reason');
      return;
    }

    setError('');
    rejectMutation.mutate(
      {
        applicationId: application.id,
        rejectionReason: rejectionReason.trim(),
      },
      {
        onSuccess: (data) => {
          if (data?.success === false) {
            setError(data.message || 'Failed to reject application');
            return;
          }
          onClose();
        },
        onError: (err) => {
          setError(err?.response?.data?.message || err.message || 'Failed to reject');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Reject Application</h3>
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
              Rejection Reason
            </label>
            <textarea
              rows="4"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this application is being rejected..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              disabled={rejectMutation.isPending}
              autoFocus
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={rejectMutation.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rejectMutation.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectApplicationModal;
