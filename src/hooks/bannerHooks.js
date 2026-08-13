import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../apiService';

export const BANNER_KEYS = {
  BANNER: 'admin-banner',
};

export const useAdminBanner = (companyId = '', options = {}) => {
  return useQuery({
    queryKey: [BANNER_KEYS.BANNER, companyId],
    queryFn: async () => {
      const params = companyId ? { companyId } : {};
      return apiService.get('/banners', params);
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, header, body, isActive }) => {
      const payload = { header, body, isActive };
      if (companyId) payload.companyId = companyId;
      return apiService.put('/banners', payload);
    },
    onSuccess: (data, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: [BANNER_KEYS.BANNER, companyId ?? ''] });
    },
    onError: (error) => {
      console.error('Failed to update banner:', error);
    },
  });
};
