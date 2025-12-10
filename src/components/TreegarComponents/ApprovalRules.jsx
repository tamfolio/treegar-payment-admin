import React, { useState } from 'react';
import { useCustomerApprovalRules, useUpdateApprovalRules } from '../../hooks/customerHooks';

const ApprovalRules = ({ customerId }) => {
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  const { 
    data: rulesResponse, 
    isLoading, 
    error 
  } = useCustomerApprovalRules(customerId);

  const updateRules = useUpdateApprovalRules();

  const rules = rulesResponse?.data;

  const handleToggleApproval = async (newMode) => {
    const newRules = {
      requireApprovalAlways: newMode === 'manual',
      autoApprove: newMode === 'auto',
      isActive: true,
      reason: reason || rules?.reason || ''
    };

    try {
      await updateRules.mutateAsync({ customerId, rules: newRules });
      setShowReasonInput(false);
      setReason('');
    } catch (error) {
      console.error('Failed to update approval rules:', error);
    }
  };

  const handleModeChange = (newMode) => {
    if (newMode !== getCurrentMode()) {
      setShowReasonInput(true);
    }
  };

  const getCurrentMode = () => {
    if (!rules) return 'unknown';
    if (rules.autoApprove) return 'auto';
    if (rules.requireApprovalAlways) return 'manual';
    return 'unknown';
  };

  const getStatusColor = (mode) => {
    switch (mode) {
      case 'auto':
        return 'bg-green-100 text-green-800';
      case 'manual':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer Approval Rules</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer Approval Rules</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading approval rules</h3>
              <p className="text-sm text-red-700 mt-1">{error?.message || 'An error occurred'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentMode = getCurrentMode();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer Approval Rules</h3>
      
      {/* Current Status */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-500 mb-2">Current Mode</label>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentMode)}`}>
          {currentMode === 'auto' ? 'Auto Approve' : 
           currentMode === 'manual' ? 'Manual Approval Required' : 
           'Unknown'}
        </span>
      </div>

      {/* Toggle Buttons */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Approval Mode</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleModeChange('auto')}
            disabled={updateRules.isLoading}
            className={`p-4 text-left border rounded-lg transition-colors ${
              currentMode === 'auto' 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
            } ${updateRules.isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <div className="font-medium">Auto Approve</div>
                <div className="text-sm text-gray-500">Transfers are approved automatically</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleModeChange('manual')}
            disabled={updateRules.isLoading}
            className={`p-4 text-left border rounded-lg transition-colors ${
              currentMode === 'manual' 
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
                : 'border-gray-300 hover:border-yellow-300 hover:bg-yellow-50'
            } ${updateRules.isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <div className="font-medium">Manual Approval</div>
                <div className="text-sm text-gray-500">Transfers require admin approval</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Reason Input Modal */}
      {showReasonInput && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-3">Reason for Change</h4>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter reason for changing approval mode..."
          />
          <div className="flex space-x-3 mt-3">
            <button
              onClick={() => handleToggleApproval('auto')}
              disabled={updateRules.isLoading}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
            >
              {updateRules.isLoading ? 'Saving...' : 'Set Auto Approve'}
            </button>
            <button
              onClick={() => handleToggleApproval('manual')}
              disabled={updateRules.isLoading}
              className="px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              {updateRules.isLoading ? 'Saving...' : 'Set Manual Approval'}
            </button>
            <button
              onClick={() => {
                setShowReasonInput(false);
                setReason('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rule Details */}
      {rules && (
        <div className="space-y-3 text-sm">
          {rules.reason && (
            <div>
              <label className="block text-sm font-medium text-gray-500">Last Change Reason</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{rules.reason}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Status:</span> {rules.isActive ? 'Active' : 'Inactive'}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {new Date(rules.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalRules;