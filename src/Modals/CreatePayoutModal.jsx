import React, { useState, useEffect } from 'react';
import { 
  useCompanies, 
  useProviderBanks, 
  useResolveAccount, 
  useCreateCompanyPayout,
  formatCompanyOptions,
  validateAccountNumber,
  validateAmount
} from '../hooks/companyhooks';

const CreatePayoutModal = ({ isOpen, onClose, onSuccess }) => {
  // Form state
  const [formData, setFormData] = useState({
    companyId: '',
    amount: '',
    beneficiaryAccountNumber: '',
    beneficiaryAccountName: '',
    beneficiaryBankCode: '',
    narration: '',
    currency: 'NGN'
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [accountResolved, setAccountResolved] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);

  // API hooks
  const { data: companiesResponse, isLoading: loadingCompanies } = useCompanies();
  const { data: banksResponse, isLoading: loadingBanks } = useProviderBanks();
  const resolveAccountMutation = useResolveAccount();
  const createPayoutMutation = useCreateCompanyPayout();

  const companies = companiesResponse?.data || [];
  const banks = banksResponse?.data || [];
  const companyOptions = formatCompanyOptions(companies);

  // Filter banks based on search term
  const filteredBanks = banks
    .filter(bank => bank.isActive)
    .filter(bank => 
      bank.bankName.toLowerCase().includes(bankSearchTerm.toLowerCase())
    )
    .sort((a, b) => a.bankName.localeCompare(b.bankName))
    .slice(0, 10); // Limit to 10 results for better UX

  // Format amount with commas
  const formatAmountDisplay = (value) => {
    if (!value) return '';
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    // Format with commas
    const parts = numericValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Parse amount back to numeric for API
  const parseAmount = (formattedAmount) => {
    return formattedAmount.replace(/,/g, '');
  };

  // Auto-resolve account when account number is 10 digits
  useEffect(() => {
    if (
      formData.beneficiaryAccountNumber.length === 10 &&
      formData.beneficiaryBankCode &&
      formData.companyId &&
      !accountResolved &&
      !isResolving
    ) {
      handleResolveAccount();
    }
  }, [formData.beneficiaryAccountNumber, formData.beneficiaryBankCode, formData.companyId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        companyId: '',
        amount: '',
        beneficiaryAccountNumber: '',
        beneficiaryAccountName: '',
        beneficiaryBankCode: '',
        narration: '',
        currency: 'NGN'
      });
      setErrors({});
      setAccountResolved(false);
      setIsResolving(false);
      setBankSearchTerm('');
      setSelectedBank(null);
      setShowBankDropdown(false);
    }
  }, [isOpen]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    if (field === 'amount') {
      // Format amount as user types
      const formattedAmount = formatAmountDisplay(value);
      setFormData(prev => ({ ...prev, [field]: formattedAmount }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Reset account resolution if account number or bank changes
    if (field === 'beneficiaryAccountNumber' || field === 'beneficiaryBankCode') {
      setAccountResolved(false);
      setFormData(prev => ({ ...prev, beneficiaryAccountName: '' }));
    }
  };

  // Handle bank selection
  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setBankSearchTerm(bank.bankName);
    setFormData(prev => ({ 
      ...prev, 
      beneficiaryBankCode: bank.bankCode,
      beneficiaryAccountName: '' 
    }));
    setShowBankDropdown(false);
    setAccountResolved(false);
    
    // Clear bank error
    if (errors.beneficiaryBankCode) {
      setErrors(prev => ({ ...prev, beneficiaryBankCode: '' }));
    }
  };

  // Handle bank search input
  const handleBankSearch = (value) => {
    setBankSearchTerm(value);
    setShowBankDropdown(true);
    
    // Clear selection if user is typing
    if (selectedBank && value !== selectedBank.bankName) {
      setSelectedBank(null);
      setFormData(prev => ({ 
        ...prev, 
        beneficiaryBankCode: '',
        beneficiaryAccountName: '' 
      }));
      setAccountResolved(false);
    }
  };

  // Resolve account name
  const handleResolveAccount = async () => {
    if (!formData.beneficiaryAccountNumber || !formData.beneficiaryBankCode || !formData.companyId) {
      setErrors({
        ...errors,
        resolve: 'Please select company, bank, and enter account number first'
      });
      return;
    }

    if (!validateAccountNumber(formData.beneficiaryAccountNumber)) {
      setErrors({
        ...errors,
        beneficiaryAccountNumber: 'Account number must be 10 digits'
      });
      return;
    }

    setIsResolving(true);
    
    try {
      const response = await resolveAccountMutation.mutateAsync({
        companyId: formData.companyId,
        accountNumber: formData.beneficiaryAccountNumber,
        bankCode: formData.beneficiaryBankCode
      });

      if (response.data?.isSuccessful) {
        setFormData(prev => ({
          ...prev,
          beneficiaryAccountName: response.data.accountName
        }));
        setAccountResolved(true);
        setErrors(prev => ({ ...prev, resolve: '' }));
      } else {
        setErrors({
          ...errors,
          resolve: response.data?.message || 'Failed to resolve account'
        });
      }
    } catch (error) {
      setErrors({
        ...errors,
        resolve: error.response?.data?.message || 'Failed to resolve account'
      });
    }
    
    setIsResolving(false);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyId) newErrors.companyId = 'Please select a company';
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (!validateAmount(parseAmount(formData.amount))) {
      newErrors.amount = 'Amount must be at least 0.01';
    }
    if (!formData.beneficiaryAccountNumber) {
      newErrors.beneficiaryAccountNumber = 'Account number is required';
    } else if (!validateAccountNumber(formData.beneficiaryAccountNumber)) {
      newErrors.beneficiaryAccountNumber = 'Account number must be 10 digits';
    }
    if (!formData.beneficiaryBankCode) newErrors.beneficiaryBankCode = 'Please select a bank';
    if (!formData.beneficiaryAccountName) newErrors.beneficiaryAccountName = 'Please resolve account name';
    if (!formData.narration) newErrors.narration = 'Narration is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!accountResolved) {
      setErrors({ ...errors, resolve: 'Please resolve account name first' });
      return;
    }

    try {
      const payoutData = {
        amount: parseFloat(parseAmount(formData.amount)),
        beneficiaryAccountNumber: formData.beneficiaryAccountNumber,
        beneficiaryAccountName: formData.beneficiaryAccountName,
        beneficiaryBankCode: formData.beneficiaryBankCode,
        narration: formData.narration,
        currency: formData.currency
      };

      const response = await createPayoutMutation.mutateAsync({
        companyId: formData.companyId,
        payoutData
      });

      if (onSuccess) {
        onSuccess(response);
      }
      onClose();
    } catch (error) {
      setErrors({
        ...errors,
        submit: error.response?.data?.message || 'Failed to create payout'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Create New Payout</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            disabled={createPayoutMutation.isPending}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Company Selection */}
          <div>
            <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-1">
              Company *
            </label>
            <select
              id="companyId"
              value={formData.companyId}
              onChange={(e) => handleInputChange('companyId', e.target.value)}
              disabled={loadingCompanies || createPayoutMutation.isPending}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.companyId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Company</option>
              {companyOptions.map((company) => (
                <option key={company.value} value={company.value}>
                  {company.label}
                </option>
              ))}
            </select>
            {errors.companyId && <p className="text-red-500 text-xs mt-1">{errors.companyId}</p>}
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₦</span>
                <input
                  type="text"
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  disabled={createPayoutMutation.isPending}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <input
                type="text"
                id="currency"
                value={formData.currency}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>
          </div>

          {/* Bank Selection - Searchable */}
          <div className="relative">
            <label htmlFor="bankSearch" className="block text-sm font-medium text-gray-700 mb-1">
              Beneficiary Bank *
            </label>
            <input
              type="text"
              id="bankSearch"
              value={bankSearchTerm}
              onChange={(e) => handleBankSearch(e.target.value)}
              onFocus={() => setShowBankDropdown(true)}
              disabled={loadingBanks || createPayoutMutation.isPending}
              placeholder="Search for a bank..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.beneficiaryBankCode ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            
            {/* Bank Dropdown */}
            {showBankDropdown && !loadingBanks && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredBanks.length > 0 ? (
                  filteredBanks.map((bank) => (
                    <button
                      key={bank.bankCode}
                      type="button"
                      onClick={() => handleBankSelect(bank)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      <div className="text-sm font-medium text-gray-900">{bank.bankName}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">No banks found</div>
                )}
              </div>
            )}
            
            {/* Click outside to close dropdown */}
            {showBankDropdown && (
              <div 
                className="fixed inset-0 z-5" 
                onClick={() => setShowBankDropdown(false)}
              ></div>
            )}
            
            {errors.beneficiaryBankCode && <p className="text-red-500 text-xs mt-1">{errors.beneficiaryBankCode}</p>}
            {/* {selectedBank && (
              <p className="text-green-600 text-xs mt-1">✓ {selectedBank.bankName} selected</p>
            )} */}
          </div>

          {/* Account Number */}
          <div>
            <label htmlFor="beneficiaryAccountNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Account Number *
            </label>
            <input
              type="text"
              id="beneficiaryAccountNumber"
              value={formData.beneficiaryAccountNumber}
              onChange={(e) => handleInputChange('beneficiaryAccountNumber', e.target.value)}
              disabled={createPayoutMutation.isPending}
              maxLength="10"
              placeholder="Enter 10-digit account number (auto-resolves at 10 digits)"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.beneficiaryAccountNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.beneficiaryAccountNumber && <p className="text-red-500 text-xs mt-1">{errors.beneficiaryAccountNumber}</p>}
            {isResolving && (
              <p className="text-blue-600 text-xs mt-1">🔄 Resolving account name...</p>
            )}
          </div>

          {/* Account Name - Read Only */}
          <div>
            <label htmlFor="beneficiaryAccountName" className="block text-sm font-medium text-gray-700 mb-1">
              Account Name *
            </label>
            <input
              type="text"
              id="beneficiaryAccountName"
              value={formData.beneficiaryAccountName}
              readOnly
              placeholder="Account name will appear here after resolution"
              className={`w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700 ${
                errors.beneficiaryAccountName ? 'border-red-500' : 'border-gray-300'
              } ${accountResolved ? 'bg-green-50 text-green-800' : ''}`}
            />
            {errors.beneficiaryAccountName && <p className="text-red-500 text-xs mt-1">{errors.beneficiaryAccountName}</p>}
            {errors.resolve && <p className="text-red-500 text-xs mt-1">{errors.resolve}</p>}
          </div>

          {/* Narration */}
          <div>
            <label htmlFor="narration" className="block text-sm font-medium text-gray-700 mb-1">
              Narration *
            </label>
            <textarea
              id="narration"
              value={formData.narration}
              onChange={(e) => handleInputChange('narration', e.target.value)}
              disabled={createPayoutMutation.isPending}
              rows="3"
              placeholder="Enter payment description or narration"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.narration ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.narration && <p className="text-red-500 text-xs mt-1">{errors.narration}</p>}
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
              onClick={onClose}
              disabled={createPayoutMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPayoutMutation.isPending || !accountResolved}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createPayoutMutation.isPending ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                'Create Payout'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePayoutModal;