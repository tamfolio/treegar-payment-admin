import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../apiService';

export const useAdminScheduledPayments = (filters = {}) => {
  return useQuery({
    queryKey: ['admin-scheduled-payments', filters],
    queryFn: async () => {
      const params = {};
      if (filters.statusId)     params.StatusId     = filters.statusId;
      if (filters.type)         params.Type         = filters.type;
      if (filters.scheduleType) params.ScheduleType = filters.scheduleType;
      if (filters.customerId)   params.CustomerId   = filters.customerId;
      if (filters.dateFrom)     params.DateFrom     = filters.dateFrom;
      if (filters.dateTo)       params.DateTo       = filters.dateTo;
      params.PageNumber = filters.pageNumber || 1;
      params.PageSize   = filters.pageSize   || 20;
      return apiService.get('/scheduled-payments', params);
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useAdminScheduledPayment = (id) => {
  return useQuery({
    queryKey: ['admin-scheduled-payment', id],
    queryFn: () => apiService.get(`/scheduled-payments/${id}`),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};

export const useAdminScheduledPaymentAttempts = (id) => {
  return useQuery({
    queryKey: ['admin-scheduled-payment-attempts', id],
    queryFn: () => apiService.get(`/scheduled-payments/${id}/attempts`),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};

export const useRetryScheduledPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiService.post(`/scheduled-payments/${id}/retry`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-scheduled-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-scheduled-payment', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-scheduled-payment-attempts', id] });
    },
  });
};