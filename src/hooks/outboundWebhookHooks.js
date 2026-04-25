import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../apiService';

export const WEBHOOK_QUERY_KEYS = {
  CONFIGS: 'webhook-configs',
  CONFIG_DETAIL: 'webhook-config-detail',
  DELIVERIES: 'webhook-deliveries',
  DELIVERY_DETAIL: 'webhook-delivery-detail',
  STATS: 'webhook-stats',
};

// ============================================================================
// GET ALL WEBHOOK CONFIGURATIONS
// ============================================================================
export const useWebhookConfigs = (filters = {}) => {
  return useQuery({
    queryKey: [WEBHOOK_QUERY_KEYS.CONFIGS, filters],
    queryFn: async () => {
      const response = await apiService.get('/outbound-webhook', filters);
      return response;
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

// ============================================================================
// GET SINGLE WEBHOOK CONFIGURATION
// ============================================================================
export const useWebhookConfig = (id) => {
  return useQuery({
    queryKey: [WEBHOOK_QUERY_KEYS.CONFIG_DETAIL, id],
    queryFn: async () => {
      const response = await apiService.get(`/outbound-webhook/${id}`);
      return response;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

// ============================================================================
// CREATE WEBHOOK CONFIGURATION
// ============================================================================
export const useCreateWebhookConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiService.post('/outbound-webhook', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([WEBHOOK_QUERY_KEYS.CONFIGS]);
      queryClient.invalidateQueries([WEBHOOK_QUERY_KEYS.STATS]);
    },
  });
};

// ============================================================================
// UPDATE WEBHOOK CONFIGURATION
// ============================================================================
export const useUpdateWebhookConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiService.put(`/outbound-webhook/${id}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries([WEBHOOK_QUERY_KEYS.CONFIGS]);
      queryClient.invalidateQueries([WEBHOOK_QUERY_KEYS.CONFIG_DETAIL, variables.id]);
    },
  });
};

// ============================================================================
// DELETE WEBHOOK CONFIGURATION
// ============================================================================
export const useDeleteWebhookConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await apiService.delete(`/outbound-webhook/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([WEBHOOK_QUERY_KEYS.CONFIGS]);
      queryClient.invalidateQueries([WEBHOOK_QUERY_KEYS.STATS]);
    },
  });
};

// ============================================================================
// GET WEBHOOK DELIVERIES (PAGINATED)
// ============================================================================
export const useWebhookDeliveries = (filters = {}) => {
  return useQuery({
    queryKey: [WEBHOOK_QUERY_KEYS.DELIVERIES, filters],
    queryFn: async () => {
      const response = await apiService.get('/outbound-webhook/deliveries', filters);
      return response;
    },
    staleTime: 1 * 60 * 1000,
    retry: 2,
  });
};

// ============================================================================
// GET SINGLE DELIVERY
// ============================================================================
export const useWebhookDelivery = (id) => {
  return useQuery({
    queryKey: [WEBHOOK_QUERY_KEYS.DELIVERY_DETAIL, id],
    queryFn: async () => {
      const response = await apiService.get(`/outbound-webhook/deliveries/${id}`);
      return response;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    retry: 2,
  });
};

// ============================================================================
// RETRY SINGLE DELIVERY
// ============================================================================
export const useRetryDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await apiService.post(`/outbound-webhook/deliveries/${id}/retry`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([WEBHOOK_QUERY_KEYS.DELIVERIES]);
      queryClient.invalidateQueries([WEBHOOK_QUERY_KEYS.STATS]);
    },
  });
};

// ============================================================================
// RESEND MULTIPLE DELIVERIES
// ============================================================================
export const useResendDeliveries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      const response = await apiService.post('/outbound-webhook/deliveries/resend', { ids });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([WEBHOOK_QUERY_KEYS.DELIVERIES]);
      queryClient.invalidateQueries([WEBHOOK_QUERY_KEYS.STATS]);
    },
  });
};

// ============================================================================
// RESEND BY DATE RANGE
// ============================================================================
export const useResendByDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fromDate, toDate, eventType }) => {
      const response = await apiService.post('/outbound-webhook/deliveries/resend-by-date', {
        fromDate,
        toDate,
        eventType,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([WEBHOOK_QUERY_KEYS.DELIVERIES]);
      queryClient.invalidateQueries([WEBHOOK_QUERY_KEYS.STATS]);
    },
  });
};

// ============================================================================
// GET STATS
// ============================================================================
export const useWebhookStats = (eventType) => {
  return useQuery({
    queryKey: [WEBHOOK_QUERY_KEYS.STATS, eventType],
    queryFn: async () => {
      const response = await apiService.get('/outbound-webhook/stats', eventType ? { eventType } : {});
      return response;
    },
    staleTime: 1 * 60 * 1000,
    retry: 2,
  });
};

// ============================================================================
// PROCESS PENDING
// ============================================================================
export const useProcessPending = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiService.post('/outbound-webhook/process-pending');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([WEBHOOK_QUERY_KEYS.DELIVERIES]);
      queryClient.invalidateQueries([WEBHOOK_QUERY_KEYS.STATS]);
    },
  });
};