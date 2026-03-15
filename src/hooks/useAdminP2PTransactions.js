import { useQuery } from '@tanstack/react-query';
import apiService from '../apiService';

export const useAdminP2PTransactions = (filters = {}) => {
  return useQuery({
    queryKey: ['admin-p2p-transactions', filters],
    queryFn: async () => {
      const params = {};
      if (filters.direction)   params.Direction   = filters.direction;
      if (filters.status)      params.Status      = filters.status;
      if (filters.category)    params.Category    = filters.category;
      if (filters.customerId)  params.CustomerId  = filters.customerId;
      if (filters.dateFrom)    params.DateFrom    = filters.dateFrom;
      if (filters.dateTo)      params.DateTo      = filters.dateTo;
      params.PageNumber = filters.pageNumber || 1;
      params.PageSize   = filters.pageSize   || 20;
      return apiService.get('/customer-p2p-requests', params);
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useAdminP2PTransaction = (id) => {
  return useQuery({
    queryKey: ['admin-p2p-transaction', id],
    queryFn: () => apiService.get(`/customer-p2p-requests/${id}`),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};

export const useAdminP2PPair = (pairReference) => {
  return useQuery({
    queryKey: ['admin-p2p-pair', pairReference],
    queryFn: () => apiService.get(`/customer-p2p-requests/pair/${pairReference}`),
    enabled: !!pairReference,
    staleTime: 30 * 1000,
  });
};