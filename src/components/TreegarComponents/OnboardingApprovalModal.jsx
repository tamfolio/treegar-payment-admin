import React from 'react';
import { useApproveCustomerOnboarding } from '../../hooks/customerHooks';

const OnboardingApprovalModal = ({ isOpen, onClose, customer }) => {
  const approveOnboarding = useApproveCustomerOnboarding();

  const handleApprove = async () => {
    if (customer?.id) {
      try {
        await approveOnboarding.mutateAsync(customer.id);
        onClose();
      } catch (error) {
        console.error('Failed to approve customer:', error);
        // Error handling is already in the hook
      }
    }
  };

  if (!isOpen) return null;

  const isAlreadyApproved = customer?.onboardingStatus === 'Approved';

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Customer Onboarding Approval
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
            <p>Email: {customer?.email}</p>
            <p>Phone: {customer?.phoneNumber}</p>
            <p>Type: {customer?.customerType}</p>
          </div>
          
          <div className="mt-3 flex space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              customer?.status === 'Active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {customer?.status}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              customer?.kycStatus === 'Verified' 
                ? 'bg-green-100 text-green-800' 
                : customer?.kycStatus === 'Pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              KYC: {customer?.kycStatus}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              customer?.onboardingStatus === 'Approved' 
                ? 'bg-green-100 text-green-800' 
                : customer?.onboardingStatus === 'Pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              Onboarding: {customer?.onboardingStatus}
            </span>
          </div>
        </div>

        {/* Action Content */}
        {isAlreadyApproved ? (
          <div className="text-center py-4">
            <svg className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Already Approved</h3>
            <p className="mt-2 text-sm text-gray-500">
              This customer's onboarding has already been approved.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Approval Confirmation</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Approving this customer will change their onboarding status from 
                    <span className="font-semibold"> {customer?.onboardingStatus}</span> to 
                    <span className="font-semibold"> Approved</span>.
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    Once approved, the customer will have full access to the platform and can perform transactions.
                  </p>
                </div>
              </div>
            </div>

            {/* Pre-approval Checklist */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Pre-approval Checklist</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <svg className={`h-4 w-4 mr-2 ${
                    customer?.kycStatus === 'Verified' ? 'text-green-600' : 'text-red-600'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {customer?.kycStatus === 'Verified' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <span className={customer?.kycStatus === 'Verified' ? 'text-green-800' : 'text-red-800'}>
                    KYC Verification: {customer?.kycStatus}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg className={`h-4 w-4 mr-2 ${
                    customer?.status === 'Active' ? 'text-green-600' : 'text-red-600'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {customer?.status === 'Active' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <span className={customer?.status === 'Active' ? 'text-green-800' : 'text-red-800'}>
                    Account Status: {customer?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning for non-verified customers */}
            {customer?.kycStatus !== 'Verified' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      This customer's KYC status is not verified. Consider completing KYC verification before approving onboarding.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          {!isAlreadyApproved && (
            <button
              onClick={handleApprove}
              disabled={approveOnboarding.isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {approveOnboarding.isLoading ? 'Approving...' : 'Approve Onboarding'}
            </button>
          )}
          <button
            onClick={onClose}
            className={`px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 ${
              isAlreadyApproved ? 'flex-1' : ''
            }`}
          >
            {isAlreadyApproved ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingApprovalModal;