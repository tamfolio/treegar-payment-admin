// Add this to your hooks folder as dashboardHooks.js or add to existing hooks

import { useQuery } from '@tanstack/react-query';
import apiService from '../apiService';

// Query Keys
export const DASHBOARD_QUERY_KEYS = {
  DASHBOARD: 'dashboard',
  METRICS: 'dashboardMetrics',
};

// Get dashboard metrics with optional date filtering
export const useDashboardMetrics = (filters = {}, options = {}) => {
  const { startDate, endDate } = filters;
  
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.DASHBOARD, DASHBOARD_QUERY_KEYS.METRICS, { startDate, endDate }],
    queryFn: async () => {
      console.log('🔍 Fetching dashboard metrics with filters:', { startDate, endDate });
      
      const params = {
        ...(startDate && startDate.trim() && { startDate }),
        ...(endDate && endDate.trim() && { endDate }),
      };
      
      const response = await apiService.get('/dashboard', params);
      
      console.log('📊 Dashboard metrics response:', response);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - metrics don't change super frequently
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always fetch fresh metrics on mount
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};