import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { useAdminUsers } from '../hooks/companyhooks.js';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import apiService from '../apiService';

// Success/Failure Modal Component
const ResultModal = ({ isOpen, onClose, type, message, details }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  
  return (
    <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          {/* Icon */}
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
            isSuccess ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isSuccess ? (
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          
          {/* Title */}
          <h3 className={`text-lg leading-6 font-medium mt-4 ${
            isSuccess ? 'text-gray-900' : 'text-red-900'
          }`}>
            {isSuccess ? 'Success!' : 'Error'}
          </h3>
          
          {/* Message */}
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">{message}</p>
            {details && (
              <p className="text-xs text-gray-400 mt-2">{details}</p>
            )}
          </div>
          
          {/* Close Button */}
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 text-base font-medium rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isSuccess
                  ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                  : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create User Modal Component
const CreateUserModal = ({ isOpen, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    mobileNumber: '',
    referalCode: '',
    password: '',
    avatar: '',
    roleId: '',
    departmentId: 0
  });
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();

  // Generate random referral code
  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Auto-generate referral code when modal opens
  React.useEffect(() => {
    if (isOpen && !formData.referalCode) {
      const newReferralCode = generateReferralCode();
      setFormData(prev => ({ ...prev, referalCode: newReferralCode }));
    }
  }, [isOpen]);

  // Fetch roles for the dropdown
  const { data: rolesResponse } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      console.log('🔍 Fetching roles for user creation...');
      const response = await apiService.get('/roles');
      console.log('📡 Roles response:', response);
      return response;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const availableRoles = rolesResponse?.data || [];

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      console.log('🔄 Creating user:', userData);
      
      // Prepare the data with proper structure
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        emailAddress: userData.emailAddress,
        mobileNumber: userData.mobileNumber,
        referalCode: userData.referalCode || '',
        password: userData.password,
        avatar: userData.avatar || '',
        roleId: parseInt(userData.roleId) || 0,
        departmentId: 0
      };
      
      console.log('📡 API payload:', payload);
      const response = await apiService.post('/users', payload);
      console.log('✅ User created successfully:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('✅ Create user success:', data);
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        emailAddress: '',
        mobileNumber: '',
        referalCode: '',
        password: '',
        avatar: '',
        roleId: '',
        departmentId: 0
      });
      setErrors({});
      onClose();
      
      // Show success modal
      onSuccess('User created successfully!', `${data?.data?.firstName || 'New user'} has been added to the system.`);
    },
    onError: (error) => {
      console.error('❌ Create user error:', error);
      
      // Handle validation errors from API
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create user';
        setErrors({ general: errorMessage });
        
        // Show error modal for non-validation errors
        if (!error.response?.data?.errors) {
          onError('Failed to create user', errorMessage);
        }
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.emailAddress.trim()) newErrors.emailAddress = 'Email address is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.roleId) newErrors.roleId = 'Role is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createUserMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    if (!createUserMutation.isPending) {
      setFormData({
        firstName: '',
        lastName: '',
        emailAddress: '',
        mobileNumber: '',
        referalCode: '',
        password: '',
        avatar: '',
        roleId: '',
        roleIds: [],
        departmentId: 0
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Create New Admin User</h3>
            <button
              onClick={handleClose}
              disabled={createUserMutation.isPending}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
            {/* Name Fields Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="First name"
                  disabled={createUserMutation.isPending}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Last name"
                  disabled={createUserMutation.isPending}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.emailAddress}
                onChange={(e) => handleChange('emailAddress', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.emailAddress ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="user@example.com"
                disabled={createUserMutation.isPending}
              />
              {errors.emailAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.emailAddress}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handleChange('mobileNumber', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.mobileNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+234xxxxxxxxxx"
                disabled={createUserMutation.isPending}
              />
              {errors.mobileNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Minimum 6 characters"
                disabled={createUserMutation.isPending}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                value={formData.roleId}
                onChange={(e) => handleChange('roleId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.roleId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={createUserMutation.isPending}
              >
                <option value="">Select a role...</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.roleId && (
                <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>
              )}
            </div>

            {/* Referral Code (Auto-generated) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Code (Auto-generated)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.referalCode}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 focus:outline-none"
                  placeholder="Will be auto-generated"
                  disabled={createUserMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newCode = generateReferralCode();
                    setFormData(prev => ({ ...prev, referalCode: newCode }));
                  }}
                  disabled={createUserMutation.isPending}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  🔄
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Click 🔄 to generate a new code</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={createUserMutation.isPending}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createUserMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-50 flex items-center"
              >
                {createUserMutation.isPending && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {createUserMutation.isPending ? 'Creating...' : 'Create Admin User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Users = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Result modal state
  const [resultModal, setResultModal] = useState({
    isOpen: false,
    type: 'success', // 'success' or 'error'
    message: '',
    details: ''
  });

  const navigate = useNavigate();

  // Fetch users data
  const { data: usersResponse, isLoading, isError, error, refetch, isFetching } = useAdminUsers();
  const users = usersResponse?.data || [];

  // Handle successful user creation
  const handleCreateUserSuccess = (message, details) => {
    console.log('🎉 User created successfully:', message);
    setResultModal({
      isOpen: true,
      type: 'success',
      message: message,
      details: details
    });
  };

  // Handle user creation error
  const handleCreateUserError = (message, details) => {
    console.error('❌ User creation failed:', message);
    setResultModal({
      isOpen: true,
      type: 'error',
      message: message,
      details: details
    });
  };

  // Close result modal
  const closeResultModal = () => {
    setResultModal({
      isOpen: false,
      type: 'success',
      message: '',
      details: ''
    });
  };

  // Get user statistics and filtered data
  const userStats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status === 1).length;
    const inactiveUsers = users.filter(user => user.status === 0).length;
    const twoFactorEnabled = users.filter(user => user.isTwoFactorEnabled).length;

    // Get unique roles
    const allRoles = users.flatMap(user => user.roles || []);
    const uniqueRoles = allRoles.reduce((acc, role) => {
      if (!acc.find(r => r.id === role.id)) {
        acc.push(role);
      }
      return acc;
    }, []);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      twoFactorEnabled,
      uniqueRoles
    };
  }, [users]);

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Status filter
      if (statusFilter === 'active' && user.status !== 1) return false;
      if (statusFilter === 'inactive' && user.status !== 0) return false;

      // Role filter
      if (roleFilter !== 'all') {
        const hasRole = user.roles?.some(role => role.id.toString() === roleFilter);
        if (!hasRole) return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.emailAddress?.toLowerCase().includes(searchLower) ||
          user.mobileNumber?.includes(searchTerm);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [users, statusFilter, roleFilter, searchTerm]);

  // Handle user row click
  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    return status === 1 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Get status text
  const getStatusText = (status) => {
    return status === 1 ? 'Active' : 'Inactive';
  };

  // Get user's primary role
  const getPrimaryRole = (roles) => {
    if (!roles || roles.length === 0) return 'No Role';
    // Return the first role or the highest priority one
    return roles[0].name;
  };

  // Get role badge color based on role name
  const getRoleBadgeColor = (roleName) => {
    switch (roleName?.toLowerCase()) {
      case 'super admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'operations':
        return 'bg-orange-100 text-orange-800';
      case 'support':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <Layout 
      title="Users" 
      subtitle="Manage admin users and their access permissions"
    >
      <div className="space-y-6">
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-black text-white p-2 text-xs rounded">
            Loading: {isLoading ? 'Yes' : 'No'} | Users: {users.length} | Error: {isError ? 'Yes' : 'No'}
          </div>
        )}

        {/* Create User Modal */}
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateUserSuccess}
          onError={handleCreateUserError}
        />

        {/* Result Modal */}
        <ResultModal
          isOpen={resultModal.isOpen}
          onClose={closeResultModal}
          type={resultModal.type}
          message={resultModal.message}
          details={resultModal.details}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900">{userStats.totalUsers}</p>
            <p className="text-xs text-blue-600">Registered admin users</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <p className="text-2xl font-bold text-gray-900">{userStats.activeUsers}</p>
            <p className="text-xs text-green-600">Currently enabled</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Inactive Users</h3>
            <p className="text-2xl font-bold text-gray-900">{userStats.inactiveUsers}</p>
            <p className="text-xs text-red-600">Disabled accounts</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">2FA Enabled</h3>
            <p className="text-2xl font-bold text-gray-900">{userStats.twoFactorEnabled}</p>
            <p className="text-xs text-indigo-600">Enhanced security</p>
          </div>
        </div>

        {/* Page Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
            <p className="text-gray-600">
              {filteredUsers.length} of {userStats.totalUsers} users displayed
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Add User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Users
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name, email, or phone..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Role
              </label>
              <select
                id="roleFilter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Roles</option>
                {userStats.uniqueRoles.map((role) => (
                  <option key={role.id} value={role.id.toString()}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              {(statusFilter !== 'all' || roleFilter !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setRoleFilter('all');
                    setSearchTerm('');
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">User Directory</h2>
            <p className="text-sm text-gray-600">
              {isLoading ? 'Loading users...' : `${filteredUsers.length} users found`}
            </p>
          </div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading users...
              </div>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">Failed to load users</p>
              <p className="text-sm text-gray-500 mb-4">{error?.message || 'Please try again'}</p>
              <button 
                onClick={() => refetch()} 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Users Table */}
          {!isLoading && !isError && (
            <>
              {filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2FA</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => {
                        const { date: createdDate, time: createdTime } = formatDate(user.createdAt);
                        const primaryRole = getPrimaryRole(user.roles);
                        
                        return (
                          <tr 
                            key={user.id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleUserClick(user.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700">
                                      {user.firstName?.charAt(0) || '?'}
                                      {user.lastName?.charAt(0) || '?'}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">ID: #{user.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.emailAddress}</div>
                              <div className="text-sm text-gray-500">{user.mobileNumber}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(primaryRole)}`}>
                                {primaryRole}
                              </span>
                              {user.roles && user.roles.length > 1 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  +{user.roles.length - 1} more
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                                {getStatusText(user.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {user.isTwoFactorEnabled ? (
                                  <span className="text-green-600">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 1L5 4l5 3 5-3-5-3zM5 6v6l5 3 5-3V6l-5 3-5-3z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                ) : (
                                  <span className="text-red-600">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{createdDate}</div>
                              <div className="text-sm text-gray-500">{createdTime}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUserClick(user.id);
                                }}
                                className="text-primary hover:text-primary-dark"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== 'all' || roleFilter !== 'all' ? (
                      'No users match your current filters.'
                    ) : (
                      'No users are currently registered.'
                    )}
                  </p>
                  {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setRoleFilter('all');
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Clear Filters & View All Users
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Users;