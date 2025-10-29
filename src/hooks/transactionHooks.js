import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../apiService';

// Query Keys for transactions
export const TRANSACTIONS_QUERY_KEYS = {
  TRANSACTIONS: 'transactions',
  ACCOUNT_TRANSACTIONS: 'accountTransactions',
};

// ============================================================================
// TRANSACTIONS QUERIES
// ============================================================================

// Get account transactions with pagination - SIMPLIFIED VERSION
export const useAccountTransactions = (accountId, pageNumber = 1, pageSize = 100, options = {}) => {
  return useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEYS.ACCOUNT_TRANSACTIONS, accountId, pageNumber, pageSize],
    queryFn: async () => {
      console.log('🔍 SINGLE API CALL - Fetching transactions for account ID:', accountId);
      
      const response = await apiService.get(`/accounts/${accountId}/transactions/paginated`, {
        pageNumber,
        pageSize,
      });
      
      console.log('📡 API Response received:', response);
      return response;
    },
    enabled: !!accountId && !isNaN(accountId) && accountId > 0,
    // Very aggressive caching to prevent refetching
    staleTime: Infinity, // Never consider data stale
    gcTime: Infinity, // Keep in cache forever
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    ...options,
  });
};

// Hook to manually invalidate transaction queries
export const useInvalidateTransactions = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAccountTransactions: (accountId) => {
      console.log('🗑️ Invalidating transactions for account:', accountId);
      queryClient.invalidateQueries({ 
        queryKey: [TRANSACTIONS_QUERY_KEYS.ACCOUNT_TRANSACTIONS, accountId] 
      });
    },
    removeAccountTransactions: (accountId) => {
      console.log('🗑️ Removing transactions cache for account:', accountId);
      queryClient.removeQueries({ 
        queryKey: [TRANSACTIONS_QUERY_KEYS.ACCOUNT_TRANSACTIONS, accountId] 
      });
    }
  };
};