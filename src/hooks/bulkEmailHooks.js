import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../apiService';

export const BULK_EMAIL_KEYS = {
  JOBS: 'bulk-email-jobs',
  JOB: 'bulk-email-job',
};

export const useBulkEmails = (filters = {}, options = {}) => {
  const { companyId = '', pageNumber = 1, pageSize = 50 } = filters;

  return useQuery({
    queryKey: [BULK_EMAIL_KEYS.JOBS, { companyId, pageNumber, pageSize }],
    queryFn: async () => {
      const params = { pageNumber, pageSize };
      if (companyId) params.companyId = companyId;
      return apiService.get('/bulk-emails', params);
    },
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useBulkEmail = (id, options = {}) => {
  return useQuery({
    queryKey: [BULK_EMAIL_KEYS.JOB, id],
    queryFn: async () => {
      return apiService.get(`/bulk-emails/${id}`);
    },
    enabled: !!id,
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useSendBulkEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, subject, body }) => {
      const payload = { subject, body };
      if (companyId) payload.companyId = companyId;
      return apiService.post('/bulk-emails', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BULK_EMAIL_KEYS.JOBS] });
    },
    onError: (error) => {
      console.error('Failed to send bulk email:', error);
    },
  });
};
