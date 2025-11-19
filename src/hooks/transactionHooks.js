import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../apiService';

// Query Keys for transactions
export const TRANSACTIONS_QUERY_KEYS = {
  TRANSACTIONS: 'transactions',
  ACCOUNT_TRANSACTIONS: 'accountTransactions',
  COMPANY_TRANSACTIONS: 'companyTransactions',
};

// ============================================================================
// COMPANY TRANSACTIONS QUERY
// ============================================================================

export const useCompanyTransactions = (companyId, page = 1, pageSize = 20, options = {}) => {
  return useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEYS.COMPANY_TRANSACTIONS, companyId, page, pageSize],
    queryFn: async () => {
      console.log('🏢 COMPANY TRANSACTIONS API CALL - Starting:', {
        companyId,
        companyIdType: typeof companyId,
        parsedCompanyId: parseInt(companyId, 10),
        page,
        pageSize,
        endpoint: `/Admin/transactions`
      });
      
      // Validate companyId
      if (!companyId) {
        console.error('❌ Company ID is required but not provided');
        throw new Error('Company ID is required');
      }

      const parsedCompanyId = parseInt(companyId, 10);
      if (isNaN(parsedCompanyId) || parsedCompanyId <= 0) {
        console.error('❌ Invalid company ID:', companyId);
        throw new Error(`Invalid company ID: ${companyId}`);
      }
      
      // Use the correct API endpoint without /Admin prefix (if apiService already includes it)
      const response = await apiService.get(`/transactions`, {
        page,
        pageSize,
        CompanyId: parsedCompanyId  // Note: Uppercase 'C' to match your API
      });
      
      console.log('📡 Company transactions API response:', response);
      return response;
    },
    enabled: !!companyId && !isNaN(parseInt(companyId, 10)) && parseInt(companyId, 10) > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      console.log('🔄 Retry attempt:', { failureCount, error: error?.message });
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('❌ useCompanyTransactions error:', error);
    },
    onSuccess: (data) => {
      console.log('✅ useCompanyTransactions success:', data);
    },
    ...options,
  });
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
      
      // API requires minimum pageSize of 100
      const apiPageSize = Math.max(pageSize, 100);
      
      const response = await apiService.get(`/accounts/${accountId}/transactions/paginated`, {
        pageNumber,
        pageSize: apiPageSize,
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
    },
    invalidateCompanyTransactions: (companyId) => {
      console.log('🗑️ Invalidating company transactions for company:', companyId);
      queryClient.invalidateQueries({ 
        queryKey: [TRANSACTIONS_QUERY_KEYS.COMPANY_TRANSACTIONS, companyId] 
      });
    }
  };
};

// Updated useAllTransactions hook with optional account number filtering
export const useAllTransactions = (page = 1, pageSize = 20, accountNumber = '') => {
  return useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEYS.TRANSACTIONS, 'all', page, pageSize, accountNumber],
    queryFn: async () => {
      console.log('🔍 Fetching transactions - Page:', page, 'PageSize:', pageSize, 'Account:', accountNumber);
      
      // If account number is provided, search for that specific account
      if (accountNumber && accountNumber.trim()) {
        const trimmedAccountNumber = accountNumber.trim();
        
        try {
          // Search for account using the accounts endpoint
          console.log('🔍 Searching for account number:', trimmedAccountNumber);
          const accountSearchResponse = await apiService.get('/accounts', {
            search: trimmedAccountNumber
          });
          
          console.log('📡 Account search response:', accountSearchResponse);
          
          // Check if we found any accounts
          const accounts = accountSearchResponse?.data?.items || accountSearchResponse?.data || [];
          
          if (!Array.isArray(accounts) || accounts.length === 0) {
            console.log('❌ No accounts found for number:', trimmedAccountNumber);
            return {
              data: {
                items: [],
                totalCount: 0,
                pageNumber: page,
                pageSize: pageSize,
                totalPages: 0,
                hasPreviousPage: false,
                hasNextPage: false
              }
            };
          }
          
          // Find exact match for account number
          const matchingAccount = accounts.find(acc => 
            acc.accountNumber === trimmedAccountNumber || 
            acc.accountNumber?.toString() === trimmedAccountNumber
          );
          
          if (!matchingAccount) {
            console.log('❌ No exact account match found for number:', trimmedAccountNumber);
            return {
              data: {
                items: [],
                totalCount: 0,
                pageNumber: page,
                pageSize: pageSize,
                totalPages: 0,
                hasPreviousPage: false,
                hasNextPage: false
              }
            };
          }
          
          console.log('✅ Found matching account:', matchingAccount);
          
          // Get account ID
          const accountId = matchingAccount.accountId || matchingAccount.id;
          
          if (!accountId) {
            console.log('❌ Account ID not found in account object');
            return {
              data: {
                items: [],
                totalCount: 0,
                pageNumber: page,
                pageSize: pageSize,
                totalPages: 0,
                hasPreviousPage: false,
                hasNextPage: false
              }
            };
          }
          
          // Since API requires minimum 100 pageSize for account transactions
          const apiMinPageSize = 100;
          const displayItemsPerPage = pageSize;
          const startItem = (page - 1) * displayItemsPerPage;
          const apiPage = Math.floor(startItem / apiMinPageSize) + 1;
          
          console.log(`🔍 Fetching API page ${apiPage} for display page ${page}`);
          
          // Fetch transactions for this account
          const transactionsResponse = await apiService.get(`/accounts/${accountId}/transactions/paginated`, {
            pageNumber: apiPage,
            pageSize: apiMinPageSize,
          });
          
          console.log('📡 Account transactions response:', transactionsResponse);
          
          if (!transactionsResponse?.data?.items) {
            return {
              data: {
                items: [],
                totalCount: 0,
                pageNumber: page,
                pageSize: pageSize,
                totalPages: 0,
                hasPreviousPage: false,
                hasNextPage: false
              }
            };
          }
          
          // Client-side pagination of the API results
          const allItems = transactionsResponse.data.items;
          const totalCount = transactionsResponse.data.totalCount || allItems.length;
          
          // Calculate the slice indices for our display page
          const localStartIndex = startItem % apiMinPageSize;
          const localEndIndex = Math.min(localStartIndex + displayItemsPerPage, allItems.length);
          
          const paginatedItems = allItems.slice(localStartIndex, localEndIndex);
          
          // If we don't have enough items on this page, we might need the next API page
          let finalItems = paginatedItems;
          if (paginatedItems.length < displayItemsPerPage && 
              transactionsResponse.data.hasNextPage && 
              localEndIndex === allItems.length) {
            
            try {
              const nextApiResponse = await apiService.get(`/accounts/${accountId}/transactions/paginated`, {
                pageNumber: apiPage + 1,
                pageSize: apiMinPageSize,
              });
              
              const nextItems = nextApiResponse?.data?.items || [];
              const remainingNeeded = displayItemsPerPage - paginatedItems.length;
              const additionalItems = nextItems.slice(0, remainingNeeded);
              
              finalItems = [...paginatedItems, ...additionalItems];
            } catch (nextPageError) {
              console.warn('Could not fetch next page for complete results:', nextPageError);
            }
          }
          
          // Calculate pagination metadata
          const totalDisplayPages = Math.ceil(totalCount / displayItemsPerPage);
          
          return {
            data: {
              items: finalItems,
              totalCount: totalCount,
              pageNumber: page,
              pageSize: displayItemsPerPage,
              totalPages: totalDisplayPages,
              hasPreviousPage: page > 1,
              hasNextPage: page < totalDisplayPages
            }
          };
          
        } catch (error) {
          console.error('❌ Error searching for account transactions:', error);
          throw new Error(`Failed to search for account number: ${trimmedAccountNumber}`);
        }
      } else {
        // No account number - fetch all transactions
        const params = {
          page,
          pageSize,
        };
        
        const response = await apiService.get('/transactions', params);
        console.log('📡 All transactions API response:', response);
        return response;
      }
    },
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      // Don't retry if it's an account not found error
      if (error?.message?.includes('Failed to search for account number')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// New hook specifically for searching accounts by account number
export const useAccountSearch = (accountNumber) => {
  return useQuery({
    queryKey: ['accounts', 'search', accountNumber],
    queryFn: async () => {
      console.log('🔍 Searching accounts for number:', accountNumber);
      
      const response = await apiService.get('/accounts', {
        search: accountNumber
      });
      
      console.log('📡 Account search API response:', response);
      return response;
    },
    enabled: !!accountNumber && accountNumber.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};