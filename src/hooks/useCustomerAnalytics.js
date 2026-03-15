import { useQuery } from '@tanstack/react-query';
import apiService from '../apiService';

export const useCustomerAnalytics = (filters = {}) => {
  return useQuery({
    queryKey: ['customer-analytics', filters],
    queryFn: async () => {
      const params = {};
      if (filters.dateFrom) params.DateFrom = filters.dateFrom;
      if (filters.dateTo)   params.DateTo   = filters.dateTo;
      return apiService.get('/customers/analytics', params);
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};