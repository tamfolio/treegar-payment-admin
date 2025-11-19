import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useUserDetails } from '../hooks/companyhooks';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch user details
  const { data: userResponse, isLoading, isError, error } = useUserDetails(id);
  const user = userResponse?.data;

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
    if (!dateString) return { date: 'N/A', time: 'N/A' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  if (isLoading) {
    return (
      <Layout title="User Details" subtitle="Loading user information...">
        <div className="p-8 text-center">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading user details...
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !user) {
    return (
      <Layout title="User Details" subtitle="Error loading user information">
        <div className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Failed to load user details</p>
          <p className="text-sm text-gray-500 mb-4">{error?.message || 'User not found'}</p>
          <Link 
            to="/users" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Back to Users
          </Link>
        </div>
      </Layout>
    );
  }

  const { date: createdDate, time: createdTime } = formatDate(user.createdAt);
  const { date: updatedDate, time: updatedTime } = formatDate(user.updatedAt);

  return (
    <Layout 
      title={`${user.firstName} ${user.lastName}`} 
      subtitle="Detailed user profile and account information"
    >
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="text-gray-300">|</span>
          <Link to="/users" className="text-primary hover:text-primary-dark">
            All Users
          </Link>
        </div>

        {/* User Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-700">
                    {user.firstName?.charAt(0) || '?'}
                    {user.lastName?.charAt(0) || '?'}
                  </span>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600 mb-2">{user.emailAddress}</p>
                
                {/* Status Badges */}
                <div className="flex items-center space-x-3 flex-wrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                    {getStatusText(user.status)}
                  </span>
                  
                  {user.isAccountLocked && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z" clipRule="evenodd" />
                      </svg>
                      Account Locked
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">User ID</label>
                <p className="mt-1 text-sm text-gray-900">#{user.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">{user.firstName} {user.lastName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Email Address</label>
                <p className="mt-1 text-sm text-gray-900">{user.emailAddress}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Mobile Number</label>
                <p className="mt-1 text-sm text-gray-900">{user.mobileNumber}</p>
              </div>

              {user.referalCode && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Referral Code</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{user.referalCode}</p>
                </div>
              )}
            </div>
          </div>

          {/* Roles and Permissions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Roles & Permissions</h3>
            </div>
            <div className="p-6">
              {user.roles && user.roles.length > 0 ? (
                <div className="space-y-3">
                  {user.roles.map((role) => (
                    <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(role.name)}`}>
                          {role.name}
                        </span>
                        <span className="text-xs text-gray-500">ID: {role.id}</span>
                      </div>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-sm text-gray-500">No roles assigned</p>
                </div>
              )}
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Account Security</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Account Status</label>
                <p className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                    {getStatusText(user.status)}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Account Lock Status</label>
                <p className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                    user.isAccountLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.isAccountLocked ? 'Locked' : 'Unlocked'}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Password Attempts</label>
                <p className="mt-1 text-sm text-gray-900">{user.passwordTries} failed attempts</p>
              </div>

              {user.accountLockedUntil && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Locked Until</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(user.accountLockedUntil).date}</p>
                </div>
              )}
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">System Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Account Created</label>
                <p className="mt-1 text-sm text-gray-900">{createdDate}</p>
                <p className="text-xs text-gray-500">{createdTime}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">{updatedDate}</p>
                <p className="text-xs text-gray-500">{updatedTime}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Role ID</label>
                <p className="mt-1 text-sm text-gray-900">{user.roleId || 'Not Set'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Department ID</label>
                <p className="mt-1 text-sm text-gray-900">{user.departmentId || 'Not Set'}</p>
              </div>

              {user.avatar && user.avatar !== 'string' && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Avatar</label>
                  <p className="mt-1 text-sm text-gray-900">{user.avatar}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDetails;