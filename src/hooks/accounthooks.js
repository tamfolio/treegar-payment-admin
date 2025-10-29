import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../apiService';

// Query Keys for accounts
export const ACCOUNTS_QUERY_KEYS = {
  ACCOUNTS: 'accounts',
  ACCOUNT: 'account',
};

// ============================================================================
// ACCOUNTS QUERIES
// ============================================================================

// Get all accounts with pagination
export const useAccounts = (page = 1, pageSize = 20, options = {}) => {
  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEYS.ACCOUNTS, { page, pageSize }],
    queryFn: async () => {
      const response = await apiService.get('/accounts', {
        page,
        pageSize,
      });
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds - accounts data changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Get single account by ID
export const useAccount = (accountId, options = {}) => {
  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEYS.ACCOUNT, accountId],
    queryFn: async () => {
      const response = await apiService.get(`/accounts/${accountId}`);
      return response;
    },
    enabled: !!accountId,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

// Search accounts
export const useSearchAccounts = (searchTerm, page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEYS.ACCOUNTS, 'search', { searchTerm, page, pageSize }],
    queryFn: async () => {
      const response = await apiService.get('/accounts/search', {
        q: searchTerm,
        page,
        pageSize,
      });
      return response;
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 30 * 1000,
  });
};

// ============================================================================
// ACCOUNTS MUTATIONS
// ============================================================================

// Create account mutation (if needed)
export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountData) => {
      const response = await apiService.post('/accounts', accountData);
      return response;
    },
    onSuccess: () => {
      // Invalidate accounts list to refetch
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_QUERY_KEYS.ACCOUNTS] });
    },
    onError: (error) => {
      console.error('Failed to create account:', error);
    },
  });
};

// Update account mutation (if needed)
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, accountData }) => {
      const response = await apiService.put(`/accounts/${accountId}`, accountData);
      return response;
    },
    onSuccess: (updatedAccount, { accountId }) => {
      // Update specific account in cache
      queryClient.setQueryData([ACCOUNTS_QUERY_KEYS.ACCOUNT, accountId], updatedAccount);
      
      // Invalidate accounts list
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_QUERY_KEYS.ACCOUNTS] });
    },
  });
};

// Delete account mutation (if needed)
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId) => {
      const response = await apiService.delete(`/accounts/${accountId}`);
      return response;
    },
    onSuccess: (_, accountId) => {
      // Remove account from cache
      queryClient.removeQueries({ queryKey: [ACCOUNTS_QUERY_KEYS.ACCOUNT, accountId] });
      
      // Invalidate accounts list
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_QUERY_KEYS.ACCOUNTS] });
    },
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

// Hook to prefetch account data
export const usePrefetchAccount = () => {
  const queryClient = useQueryClient();

  return (accountId) => {
    queryClient.prefetchQuery({
      queryKey: [ACCOUNTS_QUERY_KEYS.ACCOUNT, accountId],
      queryFn: () => apiService.get(`/accounts/${accountId}`),
      staleTime: 60 * 1000,
    });
  };
};

// Hook to manually invalidate accounts queries
export const useInvalidateAccounts = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: [ACCOUNTS_QUERY_KEYS.ACCOUNTS] }),
    invalidateAccount: (accountId) => queryClient.invalidateQueries({ queryKey: [ACCOUNTS_QUERY_KEYS.ACCOUNT, accountId] }),
  };
};