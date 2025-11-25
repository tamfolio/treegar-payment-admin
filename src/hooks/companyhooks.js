import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../apiService';

// Query Keys
export const COMPANY_QUERY_KEYS = {
  COMPANIES: 'companies',
  COMPANIES_LIST: 'companies-list',
  COMPANY_DETAILS: 'company-details',
  BANKS: 'provider-banks',
  RESOLVE_ACCOUNT: 'resolve-account',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  USERS: 'users',
  USER_DETAILS: 'user-details',
};

// ============================================================================
// FETCH ALL COMPANIES
// ============================================================================

export const useCompanies = () => {
  return useQuery({
    queryKey: [COMPANY_QUERY_KEYS.COMPANIES],
    queryFn: async () => {
      console.log('🏢 Fetching companies...');
      
      const response = await apiService.get('/companies');
      console.log('📡 Companies API response:', response);
      
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// ============================================================================
// FETCH PROVIDER BANKS
// ============================================================================

export const useProviderBanks = () => {
  return useQuery({
    queryKey: [COMPANY_QUERY_KEYS.BANKS],
    queryFn: async () => {
      console.log('🏦 Fetching provider banks...');
      
      const response = await apiService.get('/provider-banks');
      console.log('📡 Provider banks API response:', response);
      
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - banks don't change often
    retry: 2,
  });
};

// ============================================================================
// RESOLVE ACCOUNT MUTATION
// ============================================================================

export const useResolveAccount = () => {
  return useMutation({
    mutationFn: async ({ companyId, accountNumber, bankCode }) => {
      console.log('🔍 Resolving account:', { companyId, accountNumber, bankCode });
      
      const response = await apiService.post(`/companies/${companyId}/payouts/resolve-account`, {
        accountNumber,
        bankCode,
      });
      console.log('📡 Resolve account API response:', response);
      
      return response;
    },
    onSuccess: (response) => {
      console.log('✅ Account resolved successfully:', response);
    },
    onError: (error) => {
      console.error('❌ Account resolution failed:', error);
    },
  });
};

// ============================================================================
// CREATE PAYOUT MUTATION
// ============================================================================

export const useCreateCompanyPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, payoutData }) => {
      console.log('💰 Creating company payout:', { companyId, payoutData });
      
      const response = await apiService.post(`/companies/${companyId}/payouts`, payoutData);
      console.log('📡 Create payout API response:', response);
      
      return response;
    },
    onSuccess: (response) => {
      console.log('✅ Payout created successfully:', response);
      
      // Invalidate payouts list to refetch with new data
      queryClient.invalidateQueries(['payouts']);
      
    },
    onError: (error) => {
      console.error('❌ Create payout failed:', error);
    },
  });
};

// ============================================================================
// APPROVE PAYOUT MUTATION
// ============================================================================

export const useApprovePayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, payoutRequestId }) => {
      console.log('✅ Approving payout:', { companyId, payoutRequestId });
      
      const response = await apiService.post(`/companies/${companyId}/payouts/${payoutRequestId}/approve`);
      console.log('📡 Approve payout API response:', response);
      
      return response;
    },
    onSuccess: (response, variables) => {
      console.log('✅ Payout approved successfully:', response);
      
      // Invalidate payouts list to refetch with updated data
      queryClient.invalidateQueries(['payouts']);
      
    },
    onError: (error) => {
      console.error('❌ Approve payout failed:', error);
    },
  });
};

// ============================================================================
// FETCH ROLES
// ============================================================================

export const useRoles = () => {
  return useQuery({
    queryKey: [COMPANY_QUERY_KEYS.ROLES],
    queryFn: async () => {
      console.log('👥 Fetching roles...');
      
      const response = await apiService.get('/roles');
      console.log('📡 Roles API response:', response);
      
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// ============================================================================
// FETCH ADMIN USERS
// ============================================================================

export const useAdminUsers = () => {
  return useQuery({
    queryKey: [COMPANY_QUERY_KEYS.USERS],
    queryFn: async () => {
      console.log('👥 Fetching admin users...');
      
      const response = await apiService.get('/users');
      console.log('📡 Admin users API response:', response);
      
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// ============================================================================
// FETCH COMPANIES LIST
// ============================================================================

export const useCompaniesList = () => {
  return useQuery({
    queryKey: [COMPANY_QUERY_KEYS.COMPANIES_LIST],
    queryFn: async () => {
      console.log('🏢 Fetching companies list...');
      
      const response = await apiService.get('/companies');
      console.log('📡 Companies list API response:', response);
      
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// ============================================================================
// FETCH COMPANY DETAILS
// ============================================================================

export const useCompanyDetails = (companyId) => {
  return useQuery({
    queryKey: [COMPANY_QUERY_KEYS.COMPANY_DETAILS, companyId],
    queryFn: async () => {
      console.log('🏢 Fetching company details for ID:', companyId);
      
      const response = await apiService.get(`/companies/${companyId}`);
      console.log('📡 Company details API response:', response);
      
      return response;
    },
    enabled: !!companyId, // Only fetch if companyId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// ============================================================================
// ONBOARD COMPANY MUTATION
// ============================================================================

export const useOnboardCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyData) => {
      console.log('🏢 Onboarding company:', companyData);
      
      const response = await apiService.post('/companies', companyData);
      console.log('📡 Onboard company API response:', response);
      
      return response;
    },
    onSuccess: (response) => {
      console.log('✅ Company onboarded successfully:', response);
      
      // Invalidate companies list to refetch with new data
      queryClient.invalidateQueries([COMPANY_QUERY_KEYS.COMPANIES_LIST]);
      queryClient.invalidateQueries([COMPANY_QUERY_KEYS.COMPANIES]);
      
    },
    onError: (error) => {
      console.error('❌ Company onboarding failed:', error);
    },
  });
};

// ============================================================================
// ONBOARD USER MUTATION
// ============================================================================

export const useOnboardUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, userData }) => {
      console.log('👤 Onboarding user for company:', { companyId, userData });
      
      // Use Admin endpoint for user onboarding
      const response = await apiService.post(`/companies/${companyId}/users`, userData);
      console.log('📡 Onboard user API response:', response);
      
      return response;
    },
    onSuccess: (response, variables) => {
      console.log('✅ User onboarded successfully:', response);
      
      // Invalidate related queries
      queryClient.invalidateQueries([COMPANY_QUERY_KEYS.COMPANY_DETAILS, variables.companyId]);
      queryClient.invalidateQueries([COMPANY_QUERY_KEYS.USERS]);
      
    },
    onError: (error) => {
      console.error('❌ User onboarding failed:', error);
    },
  });
};

// ============================================================================
// FETCH USER DETAILS
// ============================================================================

export const useUserDetails = (userId) => {
  return useQuery({
    queryKey: [COMPANY_QUERY_KEYS.USER_DETAILS, userId],
    queryFn: async () => {
      console.log('👤 Fetching user details for ID:', userId);
      
      const response = await apiService.get(`/users/${userId}`);
      console.log('📡 User details API response:', response);
      
      return response;
    },
    enabled: !!userId, // Only fetch if userId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// ============================================================================
// FETCH PERMISSIONS
// ============================================================================

export const usePermissions = () => {
  return useQuery({
    queryKey: [COMPANY_QUERY_KEYS.PERMISSIONS],
    queryFn: async () => {
      console.log('🔐 Fetching permissions...');
      
      const response = await apiService.get('/permissions');
      console.log('📡 Permissions API response:', response);
      
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - permissions don't change often
    retry: 2,
  });
};

// ============================================================================
// REJECT PAYOUT MUTATION
// ============================================================================

export const useRejectPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, payoutRequestId, reason = null }) => {
      console.log('❌ Rejecting payout:', { companyId, payoutRequestId, reason });
      
      const response = await apiService.post(`/companies/${companyId}/payouts/${payoutRequestId}/reject`, {
        reason
      });
      console.log('📡 Reject payout API response:', response);
      
      return response;
    },
    onSuccess: (response, variables) => {
      console.log('✅ Payout rejected successfully:', response);
      
      // Invalidate payouts list to refetch with updated data
      queryClient.invalidateQueries(['payouts']);
      
    },
    onError: (error) => {
      console.error('❌ Reject payout failed:', error);
    },
  });
};

// Format bank options for select dropdown
export const formatBankOptions = (banks = []) => {
  return banks
    .filter(bank => bank.isActive)
    .sort((a, b) => a.bankName.localeCompare(b.bankName))
    .map(bank => ({
      value: bank.bankCode,
      label: `${bank.bankName} (${bank.bankCode})`,
      bankCode: bank.bankCode,
      bankName: bank.bankName,
    }));
};

// Format company options for select dropdown
export const formatCompanyOptions = (companies = []) => {
  return companies
    .filter(company => company.status === 'Active' && company.isApproved)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(company => ({
      value: company.id,
      label: `${company.name} (${company.companyCode})`,
      id: company.id,
      name: company.name,
      companyCode: company.companyCode,
    }));
};

// Validate account number (Nigerian account numbers are typically 10 digits)
export const validateAccountNumber = (accountNumber) => {
  const cleanedNumber = accountNumber.replace(/\s/g, '');
  return /^\d{10}$/.test(cleanedNumber);
};

// Validate amount
export const validateAmount = (amount) => {
  const numericAmount = parseFloat(amount);
  return numericAmount > 0 && numericAmount >= 0.01;
};

// Validate email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /\d/.test(password);
};