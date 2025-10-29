import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLogin, isAuthenticated } from '../hooks/authHooks';
import treegarLogo from '/Images/treegarlogo.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  // Use React Query login mutation
  const loginMutation = useLogin();

  // Redirect if already authenticated
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!email || !password) {
      return;
    }

    // Attempt login using React Query mutation
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          console.log('✅ Login successful, navigating to dashboard...');
          // Navigate to dashboard immediately
          navigate('/dashboard', { replace: true });
        },
        onError: (error) => {
          console.error('❌ Login error:', error);
        },
      }
    );
  };

  // Get error message from the mutation
  const getErrorMessage = () => {
    if (!loginMutation.error) return '';
    
    const error = loginMutation.error;
    
    // Handle different types of errors
    if (error.response?.status === 401) {
      return 'Invalid email or password';
    }
    if (error.response?.status === 403) {
      return 'API key missing or invalid. Please contact support.';
    }
    if (error.response?.status >= 500) {
      return 'Server error. Please try again later.';
    }
    if (error.message === 'Network Error') {
      return 'Network error. Please check your connection.';
    }
    
    // Check for API response error message
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Default error message
    return error.message || 'Something went wrong. Please try again.';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo */}
          <img
            src={treegarLogo}
            alt="Treegar Logo"
            className="mx-auto h-16 w-auto mb-4"
          />
          <h3 className="mt-2 text-center text-xl text-gray-600">
            Sign in to your account
          </h3>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-lg shadow-md">
            {/* Success Message */}
            {loginMutation.isSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                ✅ Login successful! Redirecting to dashboard...
              </div>
            )}

            {/* Error Message */}
            {loginMutation.isError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {getErrorMessage()}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loginMutation.isPending}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginMutation.isPending}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loginMutation.isPending || !email || !password}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Demo credentials: admin@example.com / password
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;