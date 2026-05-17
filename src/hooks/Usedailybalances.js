import { useQuery } from '@tanstack/react-query';
import apiService from '../apiService';

export const useDailyBalances = (filters = {}) => {
  return useQuery({
    queryKey: ['daily-balance-snapshots', filters],
    queryFn: async () => {
      const params = {};
      if (filters.companyId) params.CompanyId  = filters.companyId;
      if (filters.dateFrom)  params.DateFrom   = filters.dateFrom;
      if (filters.dateTo)    params.DateTo     = filters.dateTo;
      params.PageNumber = filters.pageNumber || 1;
      params.PageSize   = filters.pageSize   || 20;
      return apiService.get('/daily-balance-snapshots', params);
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useDailyBalancesExport = (filters = {}, enabled = false) => {
  return useQuery({
    queryKey: ['daily-balance-snapshots-export', filters],
    queryFn: async () => {
      const params = {};
      if (filters.companyId) params.CompanyId = filters.companyId;
      if (filters.dateFrom)  params.DateFrom  = filters.dateFrom;
      if (filters.dateTo)    params.DateTo    = filters.dateTo;
      return apiService.get('/daily-balance-snapshots/export', params, {
        responseType: 'blob',
      });
    },
    enabled,
    staleTime: 0,
  });
};