import React, { useState } from 'react';
import { useCustomerInflowFees, useUpdateCustomerInflowFees } from '../../hooks/customerHooks';

const CustomerInflowFeesModal = ({ isOpen, onClose, customer }) => {
  const [feeData, setFeeData] = useState({
    percentage: '',
    capAmount: '',
    currency: 'NGN',
    active: true
  });

  const { 
    data: customerFeesResponse, 
    isLoading: feesLoading 
  } = useCustomerInflowFees(customer?.id, { enabled: isOpen && !!customer?.id });

  const updateCustomerFees = useUpdateCustomerInflowFees();

  const customerFees = customerFeesResponse?.data;
  const hasCustomFees = !!customerFees;

  // Initialize form with current data when modal opens
  React.useEffect(() => {
    if (isOpen && customerFees) {
      setFeeData({
        percentage: (customerFees.percentage * 100).toString(), // Convert to percentage display
        capAmount: customerFees.capAmount.toString(),
        currency: customerFees.currency,
        active: customerFees.active
      });
    } else if (isOpen) {
      setFeeData({
        percentage: '',
        capAmount: '',
        currency: 'NGN',
        active: true
      });
    }
  }, [isOpen, customerFees]);

  const handleInputChange = (field, value) => {
    setFeeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customer?.id || !feeData.percentage || !feeData.capAmount) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await updateCustomerFees.mutateAsync({
        customerId: customer.id,
        feeData: {
          currency: feeData.currency,
          percentage: parseFloat(feeData.percentage) / 100, // Convert percentage to decimal
          capAmount: parseFloat(feeData.capAmount),
          active: feeData.active
        }
      });
      onClose();
    } catch (error) {
      console.error('Failed to update customer inflow fees:', error);
      alert('Failed to update fees. Please try again.');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Customer Inflow Fees
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
            <p>Type: {customer?.customerType}</p>
          </div>
        </div>

        {/* Loading State */}
        {feesLoading && (
          <div className="text-center py-4">
            <svg className="animate-spin h-8 w-8 text-gray-500 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500 mt-2">Loading current fees...</p>
          </div>
        )}

        {!feesLoading && (
          <>
            {/* Current Status */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
              {hasCustomFees ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">Custom fees configured</span>
                  </div>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>Percentage: <span className="font-semibold">{(customerFees.percentage * 100).toFixed(2)}%</span></p>
                    <p>Cap Amount: <span className="font-semibold">{formatCurrency(customerFees.capAmount)}</span></p>
                    <p>Status: <span className="font-semibold">{customerFees.active ? 'Active' : 'Inactive'}</span></p>
                    <p>Last Updated: <span className="font-semibold">{new Date(customerFees.updatedAt).toLocaleString()}</span></p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Using global fees</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    This customer is currently using the global inflow fee configuration. Set custom fees below to override the global settings.
                  </p>
                </div>
              )}
            </div>

            {/* Fee Configuration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fee Percentage <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={feeData.percentage}
                      onChange={(e) => handleInputChange('percentage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="0.10"
                      required
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage fee charged on inflow transactions
                  </p>
                </div>

                {/* Cap Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cap Amount (NGN) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={feeData.capAmount}
                      onChange={(e) => handleInputChange('capAmount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="1000.00"
                      required
                    />
                    <span className="absolute left-3 top-2 text-gray-500">₦</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum fee amount that can be charged
                  </p>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={feeData.active}
                  onChange={(e) => handleInputChange('active', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                  Active (fees will be applied to transactions)
                </label>
              </div>

              {/* Fee Calculation Example */}
              {feeData.percentage && feeData.capAmount && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium text-green-800 mb-2">Fee Calculation Examples</h5>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>
                      On ₦1,000: <span className="font-semibold">
                        ₦{Math.min((1000 * parseFloat(feeData.percentage || 0)) / 100, parseFloat(feeData.capAmount || 0)).toFixed(2)}
                      </span>
                    </p>
                    <p>
                      On ₦10,000: <span className="font-semibold">
                        ₦{Math.min((10000 * parseFloat(feeData.percentage || 0)) / 100, parseFloat(feeData.capAmount || 0)).toFixed(2)}
                      </span>
                    </p>
                    <p>
                      On ₦100,000: <span className="font-semibold">
                        ₦{Math.min((100000 * parseFloat(feeData.percentage || 0)) / 100, parseFloat(feeData.capAmount || 0)).toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={updateCustomerFees.isLoading || !feeData.percentage || !feeData.capAmount}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateCustomerFees.isLoading 
                    ? 'Saving...' 
                    : hasCustomFees 
                      ? 'Update Custom Fees' 
                      : 'Set Custom Fees'
                  }
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerInflowFeesModal;