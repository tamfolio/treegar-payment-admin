import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { useAdminUsers } from '../hooks/companyHooks';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  // Fetch users data
  const { data: usersResponse, isLoading, isError, error, refetch, isFetching } = useAdminUsers();
  const users = usersResponse?.data || [];

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
            {/* <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
              Add User
            </button> */}
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