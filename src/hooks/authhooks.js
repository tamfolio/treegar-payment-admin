import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../apiService';

// Query Keys for auth
export const AUTH_QUERY_KEYS = {
  USER: 'user',
  PROFILE: 'profile',
};

// ============================================================================
// LOGIN MUTATION
// ============================================================================

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials) => {
      console.log('🔐 Login attempt:', credentials.email);
      
      // Make login request to your API
      const response = await apiService.post('/login', {
        emailAddress: credentials.email,
        password: credentials.password,
      });
      
      console.log('📡 Login API response:', response);
      return response;
    },
    onSuccess: (response) => {
      console.log('✅ Login mutation success:', response);
      
      // Handle Treegar API response structure
      if (response.success && response.data) {
        const { data } = response;
        
        // Extract token
        const token = data.token;
        
        // Extract user data
        const userData = {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.emailAddress,
          emailAddress: data.emailAddress,
          mobileNumber: data.mobileNumber,
          referalCode: data.referalCode,
          avatar: data.avatar,
          status: data.status,
          roleId: data.roleId,
          departmentId: data.departmentId,
          createdAt: data.createdAt,
          // Add computed fields
          name: `${data.firstName} ${data.lastName}`,
          role: data.roleId === 0 ? 'Admin' : 'User', // Adjust based on your role logic
        };

        console.log('📦 Extracted data:', { token: token?.substring(0, 20) + '...', userData });

        // Store auth token
        if (token) {
          localStorage.setItem('authToken', token);
          console.log('💾 Token stored successfully');
        } else {
          console.error('❌ No token found in response');
          throw new Error('No authentication token received');
        }

        // Store user data
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set user data in React Query cache
        queryClient.setQueryData([AUTH_QUERY_KEYS.USER], userData);
        
        console.log('👤 User data stored:', userData);

        // Store token expiration info
        if (data.expiresAt) {
          localStorage.setItem('tokenExpiresAt', data.expiresAt);
        }

        // Invalidate all queries to refetch with new auth
        queryClient.invalidateQueries();
        
        console.log('🎉 Login process completed successfully');
        
        return { token, user: userData, response };
      } else {
        console.error('❌ Invalid response structure:', response);
        throw new Error(response.message || 'Login failed');
      }
    },
    onError: (error) => {
      console.error('❌ Login failed:', error);
      // Clear any existing auth data on login failure
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiresAt');
    },
  });
};

// ============================================================================
// LOGOUT MUTATION
// ============================================================================

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Optional: call logout endpoint if your API has one
      try {
        await apiService.post('/logout');
      } catch (error) {
        // Logout endpoint might not exist or might fail, but we still want to clear local data
        console.warn('Logout API call failed, but clearing local data anyway:', error);
      }
    },
    onSuccess: () => {
      // Clear all stored data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiresAt');
      
      // Clear all cached data
      queryClient.clear();
      
      console.log('✅ Logout successful');
    },
    onError: (error) => {
      // Even if logout API fails, clear local data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiresAt');
      queryClient.clear();
      
      console.warn('⚠️ Logout API failed, but cleared local data:', error);
    },
  });
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  
  // Check if token exists
  if (!token || !user) {
    console.log('🔍 Authentication failed: Missing token or user data');
    return false;
  }
  
  // Check if token is expired
  if (expiresAt) {
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    
    if (now >= expirationDate) {
      console.log('🔍 Authentication failed: Token expired');
      // Clear expired token
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiresAt');
      return false;
    }
  }
  
  console.log('🔍 Authentication successful');
  return true;
};

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    const parsed = user ? JSON.parse(user) : null;
    console.log('👤 getCurrentUser:', parsed);
    return parsed;
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
    // Clear corrupted user data
    localStorage.removeItem('user');
    return null;
  }
};

// Get auth token
export const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  return token;
};

// Check if token is about to expire (within 5 minutes)
export const isTokenExpiringSoon = () => {
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  if (!expiresAt) return false;
  
  const expirationDate = new Date(expiresAt);
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
  
  return expirationDate <= fiveMinutesFromNow;
};

// Get token expiration info
export const getTokenExpiration = () => {
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  if (!expiresAt) return null;
  
  return {
    expiresAt: new Date(expiresAt),
    isExpired: new Date() >= new Date(expiresAt),
    isExpiringSoon: isTokenExpiringSoon(),
  };
};

// ============================================================================
// AUTH CONTEXT HOOK (for your existing AuthContext)
// ============================================================================

// Hook to use with your existing AuthContext
export const useAuthMutation = () => {
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (email, password) => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  return {
    login,
    logout,
    isLoading: loginMutation.isPending || logoutMutation.isPending,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
    isAuthenticated: isAuthenticated(),
    user: getCurrentUser(),
    tokenExpiration: getTokenExpiration(),
  };
};

// ============================================================================
// FORGOT PASSWORD / RESET PASSWORD (if needed)
// ============================================================================

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email) => {
      const response = await apiService.post('/forgot-password', {
        emailAddress: email,
      });
      return response;
    },
    onSuccess: (response) => {
      console.log('Password reset email sent:', response);
    },
    onError: (error) => {
      console.error('Forgot password failed:', error);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ token, newPassword }) => {
      const response = await apiService.post('/reset-password', {
        token,
        newPassword,
      });
      return response;
    },
    onSuccess: (response) => {
      console.log('Password reset successful:', response);
    },
    onError: (error) => {
      console.error('Password reset failed:', error);
    },
  });
};