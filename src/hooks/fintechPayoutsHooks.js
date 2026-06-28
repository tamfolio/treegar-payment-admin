import { useQuery } from '@tanstack/react-query';
import apiService from '../apiService';

export const FINTECH_PAYOUTS_KEYS = {
  PAYOUTS: 'fintech-payouts',
  PAYOUT: 'fintech-payout',
  COMPANIES: 'fintech-payouts-companies',
};

export const useFintechPayouts = (filters = {}, options = {}) => {
  const {
    companyId = '',
    status = '',
    clientReference = '',
    transactionReference = '',
    providerReference = '',
    beneficiaryAccountNumber = '',
    minAmount = '',
    maxAmount = '',
    dateFrom = '',
    dateTo = '',
    search = '',
    pageNumber = 1,
    pageSize = 20,
  } = filters;

  return useQuery({
    queryKey: [
      FINTECH_PAYOUTS_KEYS.PAYOUTS,
      {
        companyId, status, clientReference, transactionReference,
        providerReference, beneficiaryAccountNumber, minAmount, maxAmount,
        dateFrom, dateTo, search, pageNumber, pageSize,
      },
    ],
    queryFn: async () => {
      const hasValue = (v) => v != null && String(v).trim() !== '';
      const params = {
        ...(hasValue(companyId) && { companyId }),
        ...(hasValue(status) && { status }),
        ...(hasValue(clientReference) && { clientReference }),
        ...(hasValue(transactionReference) && { transactionReference }),
        ...(hasValue(providerReference) && { providerReference }),
        ...(hasValue(beneficiaryAccountNumber) && { beneficiaryAccountNumber }),
        ...(hasValue(minAmount) && { minAmount }),
        ...(hasValue(maxAmount) && { maxAmount }),
        ...(hasValue(dateFrom) && { dateFrom }),
        ...(hasValue(dateTo) && { dateTo }),
        ...(hasValue(search) && { search }),
        pageNumber,
        pageSize,
      };
      return apiService.get('/fintech-payouts', params);
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useFintechPayoutsCompanies = (filters = {}, options = {}) => {
  const { search = '', pageNumber = 1, pageSize = 20 } = filters;

  return useQuery({
    queryKey: [FINTECH_PAYOUTS_KEYS.COMPANIES, { search, pageNumber, pageSize }],
    queryFn: async () => {
      const hasValue = (v) => v != null && String(v).trim() !== '';
      const params = {
        ...(hasValue(search) && { search }),
        pageNumber,
        pageSize,
      };
      return apiService.get('/fintech-payouts/companies', params);
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useFintechCompanyWallets = (companyId, options = {}) => {
  return useQuery({
    queryKey: [FINTECH_PAYOUTS_KEYS.COMPANIES, 'wallets', companyId],
    queryFn: async () => {
      return apiService.get(`/fintech-payouts/companies/${companyId}/wallets`);
    },
    enabled: !!companyId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useFintechPayout = (id, options = {}) => {
  return useQuery({
    queryKey: [FINTECH_PAYOUTS_KEYS.PAYOUT, id],
    queryFn: async () => {
      return apiService.get(`/fintech-payouts/${id}`);
    },
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};
