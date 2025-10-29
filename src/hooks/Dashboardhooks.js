// Add this to your hooks folder as dashboardHooks.js or add to existing hooks

import { useQuery } from '@tanstack/react-query';
import apiService from '../apiService';

// Query Keys
export const DASHBOARD_QUERY_KEYS = {
  DASHBOARD: 'dashboard',
  METRICS: 'dashboardMetrics',
};

// Get dashboard metrics
export const useDashboardMetrics = (options = {}) => {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.DASHBOARD, DASHBOARD_QUERY_KEYS.METRICS],
    queryFn: async () => {
      console.log('🔍 Fetching dashboard metrics');
      
      const response = await apiService.get('/dashboard');
      
      console.log('📊 Dashboard metrics response:', response);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - metrics don't change super frequently
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always fetch fresh metrics on mount
    ...options,
  });
};