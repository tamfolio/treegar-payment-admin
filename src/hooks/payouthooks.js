import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../apiService';

// Query Keys for payouts
export const PAYOUT_QUERY_KEYS = {
  PAYOUTS: 'payouts',
  PAYOUT_DETAILS: 'payout-details',
};

// ============================================================================
// FETCH ALL PAYOUTS
// ============================================================================

export const usePayouts = (page = 1, pageSize = 20, filters = {}) => {
  return useQuery({
    queryKey: [PAYOUT_QUERY_KEYS.PAYOUTS, page, pageSize, filters],
    queryFn: async () => {
      console.log('🔍 Fetching payouts...', { page, pageSize, filters });
      
      const params = {
        page,
        pageSize,
        ...filters
      };
      
      const response = await apiService.get('/payouts', params);
      console.log('📡 Payouts API response:', response);
      
      return response;
    },
    staleTime: 30000, // 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// ============================================================================
// FETCH PAYOUT BY ID
// ============================================================================

export const usePayoutById = (payoutId) => {
  return useQuery({
    queryKey: [PAYOUT_QUERY_KEYS.PAYOUT_DETAILS, payoutId],
    queryFn: async () => {
      console.log('🔍 Fetching payout details for ID:', payoutId);
      
      const response = await apiService.get(`/payouts/${payoutId}`);
      console.log('📡 Payout details API response:', response);
      
      return response;
    },
    enabled: !!payoutId, // Only run if payoutId is provided
    staleTime: 60000, // 1 minute
    retry: 2,
  });
};

// ============================================================================
// CREATE NEW PAYOUT MUTATION
// ============================================================================

export const useCreatePayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payoutData) => {
      console.log('💰 Creating new payout:', payoutData);
      
      const response = await apiService.post('/payouts', payoutData);
      console.log('📡 Create payout API response:', response);
      
      return response;
    },
    onSuccess: (response) => {
      console.log('✅ Payout created successfully:', response);
      
      // Invalidate payouts list to refetch with new data
      queryClient.invalidateQueries([PAYOUT_QUERY_KEYS.PAYOUTS]);
      
      // Optionally, you can also update the cache directly
      // queryClient.setQueryData([PAYOUT_QUERY_KEYS.PAYOUTS], (oldData) => {
      //   // Add new payout to the beginning of the list
      //   return oldData ? [response.data, ...oldData] : [response.data];
      // });
    },
    onError: (error) => {
      console.error('❌ Create payout failed:', error);
    },
  });
};

// ============================================================================
// UPDATE PAYOUT STATUS MUTATION
// ============================================================================

export const useUpdatePayoutStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payoutId, status, ...updateData }) => {
      console.log('🔄 Updating payout status:', { payoutId, status, updateData });
      
      const response = await apiService.put(`/payouts/${payoutId}/status`, {
        status,
        ...updateData
      });
      console.log('📡 Update payout status API response:', response);
      
      return response;
    },
    onSuccess: (response, variables) => {
      console.log('✅ Payout status updated successfully:', response);
      
      // Invalidate both payouts list and specific payout details
      queryClient.invalidateQueries([PAYOUT_QUERY_KEYS.PAYOUTS]);
      queryClient.invalidateQueries([PAYOUT_QUERY_KEYS.PAYOUT_DETAILS, variables.payoutId]);
    },
    onError: (error) => {
      console.error('❌ Update payout status failed:', error);
    },
  });
};

// ============================================================================
// APPROVE/REJECT PAYOUT MUTATION
// ============================================================================

export const useApproveRejectPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payoutId, action, reason = null }) => {
      console.log('✅/❌ Approving/Rejecting payout:', { payoutId, action, reason });
      
      const response = await apiService.post(`/payouts/${payoutId}/${action}`, {
        reason
      });
      console.log('📡 Approve/Reject payout API response:', response);
      
      return response;
    },
    onSuccess: (response, variables) => {
      console.log('✅ Payout approval/rejection successful:', response);
      
      // Invalidate both payouts list and specific payout details
      queryClient.invalidateQueries([PAYOUT_QUERY_KEYS.PAYOUTS]);
      queryClient.invalidateQueries([PAYOUT_QUERY_KEYS.PAYOUT_DETAILS, variables.payoutId]);
    },
    onError: (error) => {
      console.error('❌ Payout approval/rejection failed:', error);
    },
  });
};

// ============================================================================
// CANCEL PAYOUT MUTATION
// ============================================================================

export const useCancelPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payoutId, reason = null }) => {
      console.log('🚫 Cancelling payout:', { payoutId, reason });
      
      const response = await apiService.post(`/payouts/${payoutId}/cancel`, {
        reason
      });
      console.log('📡 Cancel payout API response:', response);
      
      return response;
    },
    onSuccess: (response, variables) => {
      console.log('✅ Payout cancelled successfully:', response);
      
      // Invalidate both payouts list and specific payout details
      queryClient.invalidateQueries([PAYOUT_QUERY_KEYS.PAYOUTS]);
      queryClient.invalidateQueries([PAYOUT_QUERY_KEYS.PAYOUT_DETAILS, variables.payoutId]);
    },
    onError: (error) => {
      console.error('❌ Cancel payout failed:', error);
    },
  });
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get payout statistics from the data
export const getPayoutStats = (payouts = []) => {
  const stats = {
    total: payouts.length,
    completed: payouts.filter(p => p.status === 'Completed').length,
    pending: payouts.filter(p => p.status === 'Pending').length,
    failed: payouts.filter(p => p.status === 'Failed').length,
    totalAmount: payouts.reduce((sum, p) => sum + (p.amount || 0), 0),
    completedAmount: payouts
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0),
  };
  
  return stats;
};

// Format currency helper
export const formatPayoutCurrency = (amount, currency = 'NGN') => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Format date helper
export const formatPayoutDate = (dateString) => {
  if (!dateString) return { date: 'N/A', time: 'N/A' };
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US'),
    time: date.toLocaleTimeString('en-US', { hour12: false }),
    full: date.toLocaleString('en-US')
  };
};