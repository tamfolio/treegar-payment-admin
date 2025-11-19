import React, { useState, useEffect } from 'react';
import { useApprovePayout, useRejectPayout } from '../hooks/companyHooks';

const PayoutActionModal = ({ 
  isOpen, 
  onClose, 
  payout, 
  action, // 'approve' or 'reject'
  onSuccess 
}) => {
  const [reason, setReason] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);

  // API hooks
  const approvePayoutMutation = useApprovePayout();
  const rejectPayoutMutation = useRejectPayout();

  // Reset modal state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setShowResult(false);
      setResultData(null);
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!payout) return;

    try {
      let response;
      
      if (action === 'approve') {
        response = await approvePayoutMutation.mutateAsync({
          companyId: payout.companyId,
          payoutRequestId: payout.id
        });
      } else if (action === 'reject') {
        response = await rejectPayoutMutation.mutateAsync({
          companyId: payout.companyId,
          payoutRequestId: payout.id,
          reason: reason.trim() || null
        });
      }

      // Show success result
      setResultData({
        success: true,
        message: response?.message || `Payout ${action}d successfully`,
        data: response
      });
      setShowResult(true);

      // Call success callback after showing result
      setTimeout(() => {
        if (onSuccess) onSuccess(response);
        onClose();
      }, 2000); // Show success for 2 seconds

    } catch (error) {
      // Show error result
      setResultData({
        success: false,
        message: error.response?.data?.message || `Failed to ${action} payout`,
        error: error
      });
      setShowResult(true);
    }
  };

  // Close modal
  const handleClose = () => {
    if (!approvePayoutMutation.isPending && !rejectPayoutMutation.isPending) {
      onClose();
    }
  };

  const isPending = approvePayoutMutation.isPending || rejectPayoutMutation.isPending;
  const isApprove = action === 'approve';
  const actionText = isApprove ? 'Approve' : 'Reject';
  const actionColor = isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

  if (!isOpen || !payout) return null;

  // Show result screen
  if (showResult && resultData) {
    return (
      <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
          <div className="text-center">
            {resultData.success ? (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
                <p className="text-sm text-gray-500 mb-4">{resultData.message}</p>
                <div className="text-xs text-gray-400">Closing automatically...</div>
              </>
            ) : (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
                <p className="text-sm text-gray-500 mb-4">{resultData.message}</p>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {actionText} Payout
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            disabled={isPending}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="mt-6">
          {/* Payout Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Payout Details</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">ID:</span> #{payout.id}</p>
              <p><span className="font-medium">Amount:</span> ₦{payout.amount?.toLocaleString()}</p>
              <p><span className="font-medium">Beneficiary:</span> {payout.beneficiaryAccountName}</p>
              <p><span className="font-medium">Account:</span> {payout.beneficiaryAccountNumber}</p>
              <p><span className="font-medium">Bank:</span> {payout.beneficiaryBankCode}</p>
            </div>
          </div>

          {/* Confirmation Text */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {isApprove ? (
                <>Are you sure you want to <span className="font-semibold text-green-600">approve</span> this payout? This action will process the payment.</>
              ) : (
                <>Are you sure you want to <span className="font-semibold text-red-600">reject</span> this payout? This action cannot be undone.</>
              )}
            </p>
          </div>

          {/* Reason (for reject only) */}
          {!isApprove && (
            <div className="mb-6">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection (Optional)
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isPending}
                rows="3"
                placeholder="Enter reason for rejecting this payout..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${actionColor}`}
            >
              {isPending ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isApprove ? 'Approving...' : 'Rejecting...'}
                </div>
              ) : (
                `${actionText} Payout`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayoutActionModal;