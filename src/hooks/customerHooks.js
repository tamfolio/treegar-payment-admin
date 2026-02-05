import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../apiService';

// Query Keys for customers
export const CUSTOMERS_QUERY_KEYS = {
  CUSTOMERS: 'customers',
  CUSTOMER: 'customer',
  CUSTOMER_PROFILE: 'customer-profile',
};

// ============================================================================
// CUSTOMERS QUERIES
// ============================================================================

// Get all customers with pagination and filters
export const useCustomers = (filters = {}, options = {}) => {
  const {
    search = '',
    companyId = '',
    customerTypeId = '',
    status = '',
    kycStatus = '',
    onboardingStatus = '',
    createdFrom = '',
    createdTo = '',
    pageNumber = 1,
    pageSize = 20,
  } = filters;

  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, { 
      search, 
      companyId, 
      customerTypeId, 
      status, 
      kycStatus, 
      onboardingStatus, 
      createdFrom, 
      createdTo, 
      pageNumber, 
      pageSize 
    }],
    queryFn: async () => {
      const params = {
        ...(search && { search }),
        ...(companyId && { companyId }),
        ...(customerTypeId && { customerTypeId }),
        ...(status && { status }),
        ...(kycStatus && { kycStatus }),
        ...(onboardingStatus && { onboardingStatus }),
        ...(createdFrom && { createdFrom }),
        ...(createdTo && { createdTo }),
        pageNumber,
        pageSize,
      };

      const response = await apiService.get('/customers', params);
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds - customer data changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Get single customer profile by ID
export const useCustomerProfile = (customerId, options = {}) => {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMER_PROFILE, customerId],
    queryFn: async () => {
      const response = await apiService.get(`/customers/${customerId}/profile`);
      return response;
    },
    enabled: !!customerId,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

// Search customers with debounced search
export const useSearchCustomers = (searchTerm, additionalFilters = {}, page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'search', { 
      searchTerm, 
      ...additionalFilters, 
      page, 
      pageSize 
    }],
    queryFn: async () => {
      const params = {
        search: searchTerm,
        pageNumber: page,
        pageSize,
        ...additionalFilters,
      };

      const response = await apiService.get('/customers', params);
      return response;
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 30 * 1000,
  });
};

// ============================================================================
// CUSTOMERS MUTATIONS
// ============================================================================

// Create customer mutation (if needed)
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerData) => {
      const response = await apiService.post('/customers', customerData);
      return response;
    },
    onSuccess: () => {
      // Invalidate customers list to refetch
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS] });
    },
    onError: (error) => {
      console.error('Failed to create customer:', error);
    },
  });
};

// Update customer mutation
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, customerData }) => {
      const response = await apiService.put(`/customers/${customerId}`, customerData);
      return response;
    },
    onSuccess: (updatedCustomer, { customerId }) => {
      // Update specific customer in cache
      queryClient.setQueryData([CUSTOMERS_QUERY_KEYS.CUSTOMER_PROFILE, customerId], updatedCustomer);
      
      // Invalidate customers list
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS] });
    },
  });
};

// Delete customer mutation (if needed)
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId) => {
      const response = await apiService.delete(`/customers/${customerId}`);
      return response;
    },
    onSuccess: (_, customerId) => {
      // Remove customer from cache
      queryClient.removeQueries({ queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMER_PROFILE, customerId] });
      
      // Invalidate customers list
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS] });
    },
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

// Hook to prefetch customer profile data
export const usePrefetchCustomerProfile = () => {
  const queryClient = useQueryClient();

  return (customerId) => {
    queryClient.prefetchQuery({
      queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMER_PROFILE, customerId],
      queryFn: () => apiService.get(`/customers/${customerId}/profile`),
      staleTime: 60 * 1000,
    });
  };
};

// Hook to manually invalidate customers queries
export const useInvalidateCustomers = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS] }),
    invalidateCustomer: (customerId) => queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMER_PROFILE, customerId] }),
  };
};

// Hook for customer statistics (if needed)
export const useCustomerStats = (filters = {}) => {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'stats', filters],
    queryFn: async () => {
      const response = await apiService.get('/customers/stats', filters);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get customer transactions with filters (or all platform transactions if no customerId)
export const useCustomerTransactions = (filters = {}, options = {}) => {
  const {
    customerId,
    search = '',
    startDate = '',
    endDate = '',
    productId = '',
    type = '',
    direction = '',
    status = '',
    minAmount = '',
    maxAmount = '',
    pageNumber = 1,
    pageSize = 20,
  } = filters;

  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'transactions', { 
      customerId,
      search, 
      startDate,
      endDate,
      productId, 
      type, 
      direction, 
      status, 
      minAmount,
      maxAmount,
      pageNumber, 
      pageSize 
    }],
    queryFn: async () => {
      const params = {
        ...(customerId && customerId.trim() && { customerId }), // Only include customerId if it's not empty
        ...(search && search.trim() && { search }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(productId && productId.toString().trim() && { productId }),
        ...(type && type.trim() && { type }),
        ...(direction && direction.trim() && { direction }),
        ...(status && status.trim() && { status }),
        ...(minAmount && minAmount.toString().trim() && { minAmount }),
        ...(maxAmount && maxAmount.toString().trim() && { maxAmount }),
        pageNumber,
        pageSize,
      };

      const response = await apiService.get('/customers/transactions', params);
      return response;
    },
    // Always enable the query - let the API handle the filtering
    enabled: true,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Get customer review data (profile, verifications, documents)
export const useCustomerReview = (customerId, options = {}) => {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'review', customerId],
    queryFn: async () => {
      const response = await apiService.get(`/customers/${customerId}/review`);
      return response;
    },
    enabled: !!customerId,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
};

// Get review status options
export const useReviewStatuses = (options = {}) => {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'review-statuses'],
    queryFn: async () => {
      const response = await apiService.get('/customers/review/statuses');
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - statuses don't change often
    ...options,
  });
};

// Update document status mutation
export const useUpdateDocumentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, status, notes }) => {
      const response = await apiService.post(`/customers/documents/${documentId}/status`, {
        status,
        notes,
      });
      return response;
    },
    onSuccess: (data, { documentId }) => {
      // Invalidate customer review queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'review'] 
      });
    },
    onError: (error) => {
      console.error('Failed to update document status:', error);
    },
  });
};

// Update verification status mutation
export const useUpdateVerificationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ verificationId, status, notes }) => {
      const response = await apiService.post(`/customers/verifications/${verificationId}/status`, {
        status,
        notes,
      });
      return response;
    },
    onSuccess: (data, { verificationId }) => {
      // Invalidate customer review queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'review'] 
      });
    },
    onError: (error) => {
      console.error('Failed to update verification status:', error);
    },
  });
};

// Get customer approval rules
export const useCustomerApprovalRules = (customerId, options = {}) => {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'approval-rules', customerId],
    queryFn: async () => {
      const response = await apiService.get(`/customer-transfer-approvals/rules/${customerId}`);
      return response;
    },
    enabled: !!customerId,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

// Update customer approval rules mutation
export const useUpdateApprovalRules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, rules }) => {
      const response = await apiService.put(`/customer-transfer-approvals/rules/${customerId}`, rules);
      return response;
    },
    onSuccess: (data, { customerId }) => {
      // Invalidate approval rules queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'approval-rules', customerId] 
      });
    },
    onError: (error) => {
      console.error('Failed to update approval rules:', error);
    },
  });
};

// Get approval queue
export const useApprovalQueue = (filters = {}, options = {}) => {
  const {
    status = '',
    customerId = '',
    take = 100,
  } = filters;

  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'approval-queue', { status, customerId, take }],
    queryFn: async () => {
      const params = {
        ...(status && { status }),
        ...(customerId && { customerId }),
        take,
      };

      const response = await apiService.get('/customer-transfer-approvals/queue', params);
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Approve transfer mutation
export const useApproveTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transferId) => {
      const response = await apiService.post(`/customer-transfer-approvals/queue/${transferId}/approve`);
      return response;
    },
    onSuccess: () => {
      // Invalidate approval queue to refresh data
      queryClient.invalidateQueries({ 
        queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'approval-queue'] 
      });
    },
    onError: (error) => {
      console.error('Failed to approve transfer:', error);
    },
  });
};

// Reject transfer mutation
export const useRejectTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transferId) => {
      const response = await apiService.post(`/customer-transfer-approvals/queue/${transferId}/reject`);
      return response;
    },
    onSuccess: () => {
      // Invalidate approval queue to refresh data
      queryClient.invalidateQueries({ 
        queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'approval-queue'] 
      });
    },
    onError: (error) => {
      console.error('Failed to reject transfer:', error);
    },
  });
};

// ============================================================================
// ONBOARDING HOOKS
// ============================================================================

// Get KYC requirements by customer type
export const useKYCRequirements = (customerType, options = {}) => {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'kyc-requirements', customerType],
    queryFn: async () => {
      const response = await apiService.get('/onboarding/kyc-requirements', {
        customerType
      });
      return response;
    },
    enabled: !!customerType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Get document requirements by customer type
export const useDocumentRequirements = (customerType, options = {}) => {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'document-requirements', customerType],
    queryFn: async () => {
      const response = await apiService.get('/onboarding/document-requirements', {
        customerType
      });
      return response;
    },
    enabled: !!customerType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Update KYC requirements mutation
export const useUpdateKYCRequirements = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requirements) => {
      const response = await apiService.put('/onboarding/kyc-requirements', requirements);
      return response;
    },
    onSuccess: () => {
      // Invalidate KYC requirements queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'kyc-requirements'] 
      });
    },
    onError: (error) => {
      console.error('Failed to update KYC requirements:', error);
    },
  });
};

// Update document requirements mutation
export const useUpdateDocumentRequirements = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requirements) => {
      const response = await apiService.put('/onboarding/document-requirements', requirements);
      return response;
    },
    onSuccess: () => {
      // Invalidate document requirements queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'document-requirements'] 
      });
    },
    onError: (error) => {
      console.error('Failed to update document requirements:', error);
    },
  });
};

// ============================================================================
// CUSTOMER ONBOARDING & PAYOUT HOOKS
// ============================================================================

// Approve customer onboarding
export const useApproveCustomerOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId) => {
      const response = await apiService.post(`/onboarding/customers/${customerId}/approve`);
      return response;
    },
    onSuccess: (data, customerId) => {
      // Invalidate customer profile queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, customerId] 
      });
      // Also invalidate customers list in case status badges need updating
      queryClient.invalidateQueries({ 
        queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS] 
      });
    },
    onError: (error) => {
      console.error('Failed to approve customer onboarding:', error);
    },
  });
};

// Update customer payout mode
export const useUpdatePayoutMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, payoutMode }) => {
      const response = await apiService.put(`/onboarding/customers/${customerId}/payout-mode`, {
        payoutMode
      });
      return response;
    },
    onSuccess: (data, { customerId }) => {
      // Invalidate customer profile queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, customerId] 
      });
      // Also invalidate customers list in case payout mode is displayed
      queryClient.invalidateQueries({ 
        queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS] 
      });
    },
    onError: (error) => {
      console.error('Failed to update payout mode:', error);
    },
  });
};

// ============================================================================
// INTEREST EXPENSE HOOKS
// ============================================================================

// Get interest expense summary
export const useInterestExpenseSummary = (filters = {}, options = {}) => {
  const { startDate, endDate } = filters;

  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'interest-expense-summary', { startDate, endDate }],
    queryFn: async () => {
      const params = {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };

      const response = await apiService.get('/interest/expense-summary', params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// ============================================================================
// INFLOW FEES HOOKS
// ============================================================================

// Get global inflow fees
export const useGlobalInflowFees = (currency = 'NGN', options = {}) => {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'global-inflow-fees', currency],
    queryFn: async () => {
      const response = await apiService.get('/inflow-fees/global', { currency });
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Update global inflow fees
export const useUpdateGlobalInflowFees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feeData) => {
      const response = await apiService.put('/inflow-fees/global', feeData);
      return response;
    },
    onSuccess: () => {
      // Invalidate global inflow fees queries
      queryClient.invalidateQueries({ 
        queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'global-inflow-fees'] 
      });
    },
    onError: (error) => {
      console.error('Failed to update global inflow fees:', error);
    },
  });
};

// Get customer inflow fees
export const useCustomerInflowFees = (customerId, options = {}) => {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'customer-inflow-fees', customerId],
    queryFn: async () => {
      const response = await apiService.get(`/inflow-fees/customers/${customerId}`);
      return response;
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Update customer inflow fees
export const useUpdateCustomerInflowFees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, feeData }) => {
      const response = await apiService.put(`/inflow-fees/customers/${customerId}`, feeData);
      return response;
    },
    onSuccess: (data, { customerId }) => {
      // Invalidate customer inflow fees queries
      queryClient.invalidateQueries({ 
        queryKey: [CUSTOMERS_QUERY_KEYS.CUSTOMERS, 'customer-inflow-fees', customerId] 
      });
    },
    onError: (error) => {
      console.error('Failed to update customer inflow fees:', error);
    },
  });
};