import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { useRoles, usePermissions } from '../hooks/companyHooks';

const RolesPermissions = () => {
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' or 'permissions'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch roles and permissions data
  const { data: rolesResponse, isLoading: loadingRoles, isError: rolesError } = useRoles();
  const { data: permissionsResponse, isLoading: loadingPermissions, isError: permissionsError } = usePermissions();

  const roles = rolesResponse?.data || [];
  const permissions = permissionsResponse?.data || [];

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    const grouped = permissions.reduce((acc, permission) => {
      const category = permission.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {});

    // Sort permissions within each category
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [permissions]);

  // Get unique categories for filtering
  const categories = useMemo(() => {
    const cats = [...new Set(permissions.map(p => p.category))].sort();
    return cats;
  }, [permissions]);

  // Filter permissions by selected category
  const filteredPermissions = useMemo(() => {
    if (selectedCategory === 'all') {
      return permissionsByCategory;
    }
    return {
      [selectedCategory]: permissionsByCategory[selectedCategory] || []
    };
  }, [permissionsByCategory, selectedCategory]);

  // Get role statistics
  const roleStats = useMemo(() => {
    return {
      totalRoles: roles.length,
      systemRoles: roles.filter(role => role.isSystemRole).length,
      customRoles: roles.filter(role => !role.isSystemRole).length,
      totalPermissions: permissions.length,
      categoriesCount: categories.length,
    };
  }, [roles, permissions, categories]);

  // Get role priority color
  const getRolePriorityColor = (priority) => {
    if (priority >= 90) return 'bg-red-100 text-red-800';
    if (priority >= 70) return 'bg-orange-100 text-orange-800';
    if (priority >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'admin':
        return '👑';
      case 'companies':
        return '🏢';
      case 'transactions':
        return '💳';
      case 'payouts':
        return '💰';
      case 'security':
        return '🔒';
      case 'support':
        return '🎧';
      case 'dashboard':
        return '📊';
      default:
        return '📋';
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'companies':
        return 'bg-blue-100 text-blue-800';
      case 'transactions':
        return 'bg-green-100 text-green-800';
      case 'payouts':
        return 'bg-yellow-100 text-yellow-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'support':
        return 'bg-indigo-100 text-indigo-800';
      case 'dashboard':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isLoading = loadingRoles || loadingPermissions;
  const hasError = rolesError || permissionsError;

  return (
    <Layout 
      title="Roles & Permissions" 
      subtitle="Manage admin roles and permissions for system access control"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Roles</h3>
            <p className="text-2xl font-bold text-gray-900">{roleStats.totalRoles}</p>
            <p className="text-xs text-blue-600">{roleStats.systemRoles} system, {roleStats.customRoles} custom</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Permissions</h3>
            <p className="text-2xl font-bold text-gray-900">{roleStats.totalPermissions}</p>
            <p className="text-xs text-green-600">Across {roleStats.categoriesCount} categories</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">System Roles</h3>
            <p className="text-2xl font-bold text-gray-900">{roleStats.systemRoles}</p>
            <p className="text-xs text-purple-600">Built-in roles</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Custom Roles</h3>
            <p className="text-2xl font-bold text-gray-900">{roleStats.customRoles}</p>
            <p className="text-xs text-orange-600">User-defined roles</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Categories</h3>
            <p className="text-2xl font-bold text-gray-900">{roleStats.categoriesCount}</p>
            <p className="text-xs text-indigo-600">Permission groups</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  👥 Roles ({roleStats.totalRoles})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'permissions'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  🔐 Permissions ({roleStats.totalPermissions})
                </span>
              </button>
            </nav>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading {activeTab}...
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">Failed to load {activeTab}</p>
              <p className="text-sm text-gray-500">Please try again later</p>
            </div>
          )}

          {/* Roles Tab Content */}
          {!isLoading && !hasError && activeTab === 'roles' && (
            <div className="p-6">
              <div className="space-y-6">
                {roles.map((role) => (
                  <div key={role.id} className="border border-gray-200 rounded-lg p-6">
                    {/* Role Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRolePriorityColor(role.priority)}`}>
                          Priority: {role.priority}
                        </span>
                        {role.isSystemRole && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            System Role
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {role.permissions?.length || 0} permissions
                      </div>
                    </div>

                    {/* Role Description */}
                    <p className="text-gray-600 mb-4">{role.description}</p>

                    {/* Role Permissions */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Permissions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {role.permissions?.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm">{getCategoryIcon(permission.category)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                              <p className="text-xs text-gray-500">{permission.description}</p>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getCategoryColor(permission.category)} mt-1`}>
                                {permission.category}
                              </span>
                            </div>
                          </div>
                        )) || []}
                      </div>
                      
                      {(!role.permissions || role.permissions.length === 0) && (
                        <p className="text-sm text-gray-500 italic">No permissions assigned to this role</p>
                      )}
                    </div>
                  </div>
                ))}

                {roles.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Roles Found</h3>
                    <p className="text-gray-500">No roles are currently configured.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Permissions Tab Content */}
          {!isLoading && !hasError && activeTab === 'permissions' && (
            <div className="p-6">
              {/* Category Filter */}
              <div className="mb-6">
                <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </label>
                <select
                  id="categoryFilter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Permissions by Category */}
              <div className="space-y-6">
                {Object.entries(filteredPermissions).map(([category, categoryPermissions]) => (
                  <div key={category} className="border border-gray-200 rounded-lg">
                    {/* Category Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCategoryIcon(category)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {category.charAt(0).toUpperCase() + category.slice(1)} Permissions
                          </h3>
                          <p className="text-sm text-gray-500">{categoryPermissions.length} permissions</p>
                        </div>
                      </div>
                    </div>

                    {/* Category Permissions */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{permission.name}</h4>
                              <span className="text-xs text-gray-500 font-mono">#{permission.id}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{permission.description}</p>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getCategoryColor(permission.category)}`}>
                                {permission.category}
                              </span>
                              <span className="text-xs text-gray-500 font-mono">{permission.key}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {Object.keys(filteredPermissions).length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Permissions Found</h3>
                    <p className="text-gray-500">
                      {selectedCategory === 'all' 
                        ? 'No permissions are currently configured.'
                        : `No permissions found in the ${selectedCategory} category.`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RolesPermissions;