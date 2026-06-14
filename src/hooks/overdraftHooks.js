import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../apiService';

// Query Keys
export const OVERDRAFT_QUERY_KEYS = {
  APPLICATIONS: 'overdraft-applications',
  APPLICATION: 'overdraft-application',
  ACCOUNTS: 'overdraft-accounts',
  ACCOUNT: 'overdraft-account',
};

// ============================================================================
// APPLICATIONS QUERIES
// ============================================================================

// List applications
export const useOverdraftApplications = (filters = {}, options = {}) => {
  const { status = '', pageNumber = 1, pageSize = 20 } = filters;

  return useQuery({
    queryKey: [OVERDRAFT_QUERY_KEYS.APPLICATIONS, { status, pageNumber, pageSize }],
    queryFn: async () => {
      const params = {
        ...(status && { status }),
        pageNumber,
        pageSize,
      };
      const response = await apiService.get('/overdraft/applications', params);
      return response;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

// Get single application
export const useOverdraftApplication = (applicationId, options = {}) => {
  return useQuery({
    queryKey: [OVERDRAFT_QUERY_KEYS.APPLICATION, applicationId],
    queryFn: async () => {
      const response = await apiService.get(`/overdraft/applications/${applicationId}`);
      return response;
    },
    enabled: !!applicationId,
    staleTime: 30 * 1000,
    ...options,
  });
};

// ============================================================================
// APPLICATIONS MUTATIONS
// ============================================================================

// Approve application
export const useApproveOverdraftApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, overdraftLimit, dailyInterestRate }) => {
      const response = await apiService.put(
        `/overdraft/applications/${applicationId}/approve`,
        { overdraftLimit, dailyInterestRate }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OVERDRAFT_QUERY_KEYS.APPLICATIONS] });
      queryClient.invalidateQueries({ queryKey: [OVERDRAFT_QUERY_KEYS.APPLICATION] });
      queryClient.invalidateQueries({ queryKey: [OVERDRAFT_QUERY_KEYS.ACCOUNTS] });
    },
    onError: (error) => {
      console.error('Failed to approve application:', error);
    },
  });
};

// Reject application
export const useRejectOverdraftApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, rejectionReason }) => {
      const response = await apiService.put(
        `/overdraft/applications/${applicationId}/reject`,
        { rejectionReason }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OVERDRAFT_QUERY_KEYS.APPLICATIONS] });
      queryClient.invalidateQueries({ queryKey: [OVERDRAFT_QUERY_KEYS.APPLICATION] });
    },
    onError: (error) => {
      console.error('Failed to reject application:', error);
    },
  });
};

// ============================================================================
// ACCOUNTS QUERIES
// ============================================================================

// List accounts
export const useOverdraftAccounts = (filters = {}, options = {}) => {
  const {
    status = '',
    customerId = '',
    minDaysOverdrawn = '',
    pageNumber = 1,
    pageSize = 20,
  } = filters;

  return useQuery({
    queryKey: [OVERDRAFT_QUERY_KEYS.ACCOUNTS, { status, customerId, minDaysOverdrawn, pageNumber, pageSize }],
    queryFn: async () => {
      const hasValue = (v) => v != null && String(v).trim() !== '';
      const params = {
        ...(hasValue(status) && { status }),
        ...(hasValue(customerId) && { customerId }),
        ...(hasValue(minDaysOverdrawn) && { minDaysOverdrawn }),
        pageNumber,
        pageSize,
      };
      const response = await apiService.get('/overdraft/accounts', params);
      return response;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

// Get single account
export const useOverdraftAccount = (customerId, options = {}) => {
  return useQuery({
    queryKey: [OVERDRAFT_QUERY_KEYS.ACCOUNT, customerId],
    queryFn: async () => {
      const response = await apiService.get(`/overdraft/accounts/${customerId}`);
      return response;
    },
    enabled: !!customerId,
    staleTime: 30 * 1000,
    ...options,
  });
};

// ============================================================================
// ACCOUNTS MUTATIONS
// ============================================================================

// Update overdraft limit
export const useUpdateOverdraftLimit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, overdraftLimit, dailyInterestRate }) => {
      const response = await apiService.put(
        `/overdraft/accounts/${customerId}/limit`,
        { overdraftLimit, dailyInterestRate }
      );
      return response;
    },
    onSuccess: (data, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: [OVERDRAFT_QUERY_KEYS.ACCOUNTS] });
      queryClient.invalidateQueries({ queryKey: [OVERDRAFT_QUERY_KEYS.ACCOUNT, customerId] });
    },
    onError: (error) => {
      console.error('Failed to update limit:', error);
    },
  });
};

// Update overdraft status
export const useUpdateOverdraftStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, status }) => {
      const response = await apiService.put(
        `/overdraft/accounts/${customerId}/status`,
        { status }
      );
      return response;
    },
    onSuccess: (data, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: [OVERDRAFT_QUERY_KEYS.ACCOUNTS] });
      queryClient.invalidateQueries({ queryKey: [OVERDRAFT_QUERY_KEYS.ACCOUNT, customerId] });
    },
    onError: (error) => {
      console.error('Failed to update status:', error);
    },
  });
};

// Write off
export const useWriteOffOverdraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId) => {
      const response = await apiService.post(
        `/overdraft/accounts/${customerId}/write-off`
      );
      return response;
    },
    onSuccess: (data, customerId) => {
      queryClient.invalidateQueries({ queryKey: [OVERDRAFT_QUERY_KEYS.ACCOUNTS] });
      queryClient.invalidateQueries({ queryKey: [OVERDRAFT_QUERY_KEYS.ACCOUNT, customerId] });
    },
    onError: (error) => {
      console.error('Failed to write off:', error);
    },
  });
};