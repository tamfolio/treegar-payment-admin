import React, { useState } from 'react';
import { useUpdatePayoutMode } from '../../hooks/customerHooks';

const PayoutModeModal = ({ isOpen, onClose, customer }) => {
  const [selectedMode, setSelectedMode] = useState(customer?.payoutMode || 'Auto');
  const updatePayoutMode = useUpdatePayoutMode();

  const handleUpdate = async () => {
    if (customer?.id && selectedMode !== customer?.payoutMode) {
      try {
        await updatePayoutMode.mutateAsync({
          customerId: customer.id,
          payoutMode: selectedMode
        });
        onClose();
      } catch (error) {
        console.error('Failed to update payout mode:', error);
        // Error handling is already in the hook
      }
    } else {
      onClose();
    }
  };

  // Reset selected mode when modal opens
  React.useEffect(() => {
    if (isOpen && customer?.payoutMode) {
      setSelectedMode(customer.payoutMode);
    }
  }, [isOpen, customer?.payoutMode]);

  if (!isOpen) return null;

  const hasChanges = selectedMode !== customer?.payoutMode;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Update Payout Mode
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Customer Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            {customer?.businessName || `${customer?.firstName} ${customer?.lastName}`}
          </h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Customer Code: <span className="font-mono">{customer?.customerCode}</span></p>
            <p>Current Payout Mode: <span className="font-semibold">{customer?.payoutMode}</span></p>
            <p>Onboarding Mode: <span className="font-semibold">{customer?.onboardingMode}</span></p>
          </div>
        </div>

        {/* Payout Mode Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payout Mode
            </label>
            
            <div className="space-y-3">
              {/* Auto Mode */}
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMode === 'Auto'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
              }`}>
                <input
                  type="radio"
                  name="payoutMode"
                  value="Auto"
                  checked={selectedMode === 'Auto'}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-medium text-gray-900">Auto Payout</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Payouts are processed automatically according to system rules and schedules.
                  </p>
                </div>
              </label>

              {/* Manual Mode */}
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMode === 'Manual'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-300 hover:border-yellow-300 hover:bg-yellow-50'
              }`}>
                <input
                  type="radio"
                  name="payoutMode"
                  value="Manual"
                  checked={selectedMode === 'Manual'}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="font-medium text-gray-900">Manual Payout</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Payouts require manual approval from an admin before processing.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Impact Information */}
          <div className={`p-4 rounded-lg border ${
            selectedMode === 'Auto' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex">
              <svg className={`h-5 w-5 ${
                selectedMode === 'Auto' ? 'text-green-400' : 'text-yellow-400'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h4 className={`text-sm font-medium ${
                  selectedMode === 'Auto' ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  Impact of {selectedMode} Payout Mode
                </h4>
                <div className={`text-sm mt-1 ${
                  selectedMode === 'Auto' ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {selectedMode === 'Auto' ? (
                    <ul className="space-y-1">
                      <li>• Faster payout processing</li>
                      <li>• Reduced administrative overhead</li>
                      <li>• Immediate fund transfers based on system rules</li>
                      <li>• Better customer experience with quick settlements</li>
                    </ul>
                  ) : (
                    <ul className="space-y-1">
                      <li>• Enhanced security and control</li>
                      <li>• Manual review of all payout requests</li>
                      <li>• Ability to verify transactions before processing</li>
                      <li>• Slower processing times for customers</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Changes notification */}
          {hasChanges && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 011 1v2a1 1 0 01-1 1h-1l-.866 5.196A2 2 0 0114.131 14H9.87a2 2 0 01-1.993-1.804L7.001 8H6a1 1 0 01-1-1V5a1 1 0 011-1h1z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    Changing from <span className="font-semibold">{customer?.payoutMode}</span> to{' '}
                    <span className="font-semibold">{selectedMode}</span> mode.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleUpdate}
            disabled={updatePayoutMode.isLoading || !hasChanges}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updatePayoutMode.isLoading 
              ? 'Updating...' 
              : hasChanges 
                ? 'Update Payout Mode' 
                : 'No Changes'
            }
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayoutModeModal;