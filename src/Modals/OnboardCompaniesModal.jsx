import React, { useState, useEffect } from 'react';
import { useOnboardCompany } from '../hooks/companyhooks';

const OnboardCompanyModal = ({ isOpen, onClose, onSuccess }) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    externalReference: ''
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);

  // API hook
  const onboardCompanyMutation = useOnboardCompany();

  // Generate random external reference with TREEGAR- prefix
  const generateExternalReference = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'TREEGAR-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        description: '',
        externalReference: ''
      });
      setErrors({});
      setShowResult(false);
      setResultData(null);
    }
  }, [isOpen]);

  // Auto-generate external reference when modal opens
  useEffect(() => {
    if (isOpen && !formData.externalReference) {
      const newReference = generateExternalReference();
      setFormData(prev => ({ ...prev, externalReference: newReference }));
    }
  }, [isOpen]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Company name must be at least 2 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters';
    }

    if (!formData.externalReference.trim()) {
      newErrors.externalReference = 'External reference is required';
    } else if (!formData.externalReference.startsWith('TREEGAR-')) {
      newErrors.externalReference = 'External reference must start with TREEGAR-';
    } else if (formData.externalReference.trim().length < 16) {
      newErrors.externalReference = 'External reference must be at least 16 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const companyData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        externalReference: formData.externalReference.trim()
      };

      const response = await onboardCompanyMutation.mutateAsync(companyData);

      // Show success result
      setResultData({
        success: true,
        message: response?.message || 'Company onboarded successfully!',
        data: response.data
      });
      setShowResult(true);

      // Call success callback after showing result
      setTimeout(() => {
        if (onSuccess) onSuccess(response);
        onClose();
      }, 2500); // Show success for 2.5 seconds

    } catch (error) {
      // Show error result
      setResultData({
        success: false,
        message: error.response?.data?.message || 'Failed to onboard company',
        error: error
      });
      setShowResult(true);
    }
  };

  // Close modal
  const handleClose = () => {
    if (!onboardCompanyMutation.isPending) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Show result screen
  if (showResult && resultData) {
    return (
      <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
          <div className="text-center">
            {resultData.success ? (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
                <p className="text-sm text-gray-500 mb-4">{resultData.message}</p>
                
                {/* Show created company info */}
                {resultData.data && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                    <h4 className="font-medium text-gray-900 mb-2">Company Created</h4>
                    <div className="space-y-1 text-xs">
                      <p><span className="font-medium">ID:</span> #{resultData.data.id}</p>
                      <p><span className="font-medium">Name:</span> {resultData.data.name}</p>
                      <p><span className="font-medium">Code:</span> {resultData.data.companyCode}</p>
                      <p><span className="font-medium">Reference:</span> {resultData.data.externalReference}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          resultData.data.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {resultData.data.status}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-400">Closing automatically...</div>
              </>
            ) : (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
                <p className="text-sm text-gray-500 mb-4">{resultData.message}</p>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Try Again
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
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Onboard New Company</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            disabled={onboardCompanyMutation.isPending}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Company Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={onboardCompanyMutation.isPending}
              placeholder="Enter company name"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={onboardCompanyMutation.isPending}
              rows="3"
              placeholder="Enter company description"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* External Reference */}
          <div>
            <label htmlFor="externalReference" className="block text-sm font-medium text-gray-700 mb-1">
              External Reference (Auto-generated)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="externalReference"
                value={formData.externalReference}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 focus:outline-none"
                placeholder="Will be auto-generated"
              />
              <button
                type="button"
                onClick={() => {
                  const newReference = generateExternalReference();
                  setFormData(prev => ({ ...prev, externalReference: newReference }));
                }}
                disabled={onboardCompanyMutation.isPending}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                🔄
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Click 🔄 to generate a new reference</p>
            {errors.externalReference && <p className="text-red-500 text-xs mt-1">{errors.externalReference}</p>}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.submit}
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={onboardCompanyMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={onboardCompanyMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {onboardCompanyMutation.isPending ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Company...
                </div>
              ) : (
                'Onboard Company'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardCompanyModal;