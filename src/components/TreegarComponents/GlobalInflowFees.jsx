import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useGlobalInflowFees, useUpdateGlobalInflowFees } from '../../hooks/customerHooks';

const GlobalInflowFees = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [feeData, setFeeData] = useState({
    percentage: '',
    capAmount: '',
    currency: 'NGN',
    active: true
  });

  const { 
    data: globalFeesResponse, 
    isLoading, 
    error 
  } = useGlobalInflowFees('NGN');

  const updateGlobalFees = useUpdateGlobalInflowFees();

  const globalFees = globalFeesResponse?.data;

  // Initialize form with current data when editing starts
  React.useEffect(() => {
    if (isEditing && globalFees) {
      setFeeData({
        percentage: (globalFees.percentage * 100).toString(), // Convert to percentage display
        capAmount: globalFees.capAmount.toString(),
        currency: globalFees.currency,
        active: globalFees.active
      });
    }
  }, [isEditing, globalFees]);

  const handleInputChange = (field, value) => {
    setFeeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feeData.percentage || !feeData.capAmount) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await updateGlobalFees.mutateAsync({
        currency: feeData.currency,
        percentage: parseFloat(feeData.percentage) / 100, // Convert percentage to decimal
        capAmount: parseFloat(feeData.capAmount),
        active: feeData.active
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update global inflow fees:', error);
      alert('Failed to update fees. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFeeData({
      percentage: '',
      capAmount: '',
      currency: 'NGN',
      active: true
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Global Inflow Fees</h1>
          <p className="text-gray-600 mt-2">Configure default inflow fee settings for all customers</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading global fees</h3>
                <p className="text-sm text-red-700 mt-1">{error?.message || 'An error occurred'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl">
          {/* Current Configuration */}
          <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Current Global Configuration</h2>
                {!isEditing && !isLoading && globalFees && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  >
                    Edit Settings
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : globalFees ? (
                <>
                  {/* Current Settings Display */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {(globalFees.percentage * 100).toFixed(2)}%
                      </div>
                      <div className="text-sm text-blue-800 font-medium">Fee Percentage</div>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(globalFees.capAmount)}
                      </div>
                      <div className="text-sm text-green-800 font-medium">Cap Amount</div>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className={`text-2xl font-bold ${globalFees.active ? 'text-green-600' : 'text-red-600'}`}>
                        {globalFees.active ? 'Active' : 'Inactive'}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Status</div>
                    </div>
                  </div>

                  {/* Fee Calculation Examples */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Fee Calculation Examples</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-700">Transaction: ₦1,000</div>
                        <div className="text-gray-600">
                          Fee: {formatCurrency(Math.min((1000 * globalFees.percentage), globalFees.capAmount))}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-700">Transaction: ₦10,000</div>
                        <div className="text-gray-600">
                          Fee: {formatCurrency(Math.min((10000 * globalFees.percentage), globalFees.capAmount))}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-700">Transaction: ₦100,000</div>
                        <div className="text-gray-600">
                          Fee: {formatCurrency(Math.min((100000 * globalFees.percentage), globalFees.capAmount))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Last Updated: {new Date(globalFees.updatedAt).toLocaleString()}</p>
                    {globalFees.updatedByAdminId && (
                      <p>Updated by Admin ID: {globalFees.updatedByAdminId}</p>
                    )}
                    <p>Currency: {globalFees.currency}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No Global Fees Configured</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    No global inflow fee configuration found.
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  >
                    Configure Global Fees
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {globalFees ? 'Edit Global Fees' : 'Configure Global Fees'}
                </h2>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      Active (fees will be applied to all customer transactions)
                    </label>
                  </div>

                  {/* Live Fee Calculation */}
                  {feeData.percentage && feeData.capAmount && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-3">Live Fee Calculation Preview</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white p-3 rounded border">
                          <div className="font-medium text-gray-700">On ₦1,000</div>
                          <div className="text-blue-600 font-semibold">
                            ₦{Math.min((1000 * parseFloat(feeData.percentage || 0)) / 100, parseFloat(feeData.capAmount || 0)).toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="font-medium text-gray-700">On ₦10,000</div>
                          <div className="text-blue-600 font-semibold">
                            ₦{Math.min((10000 * parseFloat(feeData.percentage || 0)) / 100, parseFloat(feeData.capAmount || 0)).toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="font-medium text-gray-700">On ₦100,000</div>
                          <div className="text-blue-600 font-semibold">
                            ₦{Math.min((100000 * parseFloat(feeData.percentage || 0)) / 100, parseFloat(feeData.capAmount || 0)).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={updateGlobalFees.isLoading || !feeData.percentage || !feeData.capAmount}
                      className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updateGlobalFees.isLoading 
                        ? 'Saving...' 
                        : globalFees 
                          ? 'Update Global Fees' 
                          : 'Save Global Fees'
                      }
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Information Panel */}
          <div className="bg-blue-50 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">How Inflow Fees Work</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>Global Fees:</strong> These settings apply to all customers by default. They determine the percentage fee and maximum cap for inflow transactions.
              </p>
              <p>
                <strong>Customer-Specific Overrides:</strong> Individual customers can have custom fee settings that override these global settings. You can configure these in each customer's profile.
              </p>
              <p>
                <strong>Fee Calculation:</strong> The actual fee charged is the minimum of (transaction_amount × percentage) and cap_amount. For example, with 0.1% and ₦1,000 cap, a ₦100,000 transaction would be charged ₦100 (0.1% of ₦100,000), but a ₦2,000,000 transaction would be capped at ₦1,000.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GlobalInflowFees;